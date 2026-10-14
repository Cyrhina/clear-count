<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\SubscriptionPayment;
use App\Models\User;
use App\Notifications\ApprovalNotice;
use App\Support\Plans;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The company's side of the subscription: its plan and usage, a downgrade (right away) and an upgrade payment (waits for the
 * super admin to confirm it, see PlatformController::decidePayment). The route group requires `subscription.manage`.
 */
class SubscriptionController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $company = $this->company($request);
        $usage = Plans::usage($company);
        $pending = SubscriptionPayment::where('status', 'pending')->latest('id')->first();

        return response()->json(['data' => [
            'plan_tier' => $company->plan_tier,
            'employee_count' => $usage['employees'],
            'user_count' => $usage['users'],
            'billing_interval' => 'monthly',
            'next_renewal_date' => $company->plan_renews_on?->toDateString(),
            'monthly_price' => Plans::tier($company->plan_tier)['monthly_price'],
            'pending_payment' => $pending ? self::payment($pending) : null,
        ]]);
    }

    /** What the company would pay each month on `$tier`, null when that plan is quoted by hand. */
    public function quote(Request $request, string $tier): JsonResponse
    {
        abort_unless(array_key_exists($tier, Plans::tiers()), 404);

        return response()->json(['data' => ['amount' => Plans::quote($tier, Plans::usage($this->company($request))['employees'])]]);
    }

    /** A downgrade applies right away, but only when the company already fits in the smaller plan. */
    public function downgrade(Request $request): JsonResponse
    {
        $company = $this->company($request);
        $order = Plans::order();
        $tier = $request->validate(['plan_tier' => ['required', Rule::in($order)]])['plan_tier'];
        if (array_search($tier, $order) >= array_search($company->plan_tier, $order)) {
            throw ValidationException::withMessages(['plan_tier' => 'Choose a smaller plan than the current one.']);
        }

        $seats = Plans::tier($tier)['user_limit'];
        $users = Plans::usage($company)['users'];
        if ($seats !== null && $users > $seats) {
            $label = Plans::tier($tier)['label'];
            throw ValidationException::withMessages(['plan_tier' => "The {$label} plan includes {$seats} user accounts and {$users} are active. Deactivate ".($users - $seats).' first.']);
        }

        $company->forceFill(['plan_tier' => $tier])->save();

        return $this->show($request);
    }

    /** The company paid: records the payment as pending. The plan does not change until the super admin confirms it. */
    public function storePayment(Request $request): JsonResponse
    {
        $company = $this->company($request);
        $data = $request->validate([
            'to_tier' => ['required', Rule::in(Plans::order())],
            'payment_reference' => ['required', 'regex:/^FBS-[A-Z]{3,7}-\d{5}$/', Rule::unique('subscription_payments', 'payment_reference')],
            'receipt_reference' => ['required', 'string', 'min:6', 'max:100'],
            'proof' => ['required', 'file', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'terms_accepted' => ['accepted'],
        ]);

        $order = Plans::order();
        if (array_search($data['to_tier'], $order) <= array_search($company->plan_tier, $order)) {
            throw ValidationException::withMessages(['to_tier' => 'Choose a bigger plan than the current one.']);
        }
        $amount = Plans::quote($data['to_tier'], Plans::usage($company)['employees']);
        if ($amount === null) {
            throw ValidationException::withMessages(['to_tier' => 'This plan is quoted by hand. Contact sales.']);
        }
        if (SubscriptionPayment::where('status', 'pending')->exists()) {
            throw ValidationException::withMessages(['to_tier' => 'A payment is already waiting for verification.']);
        }

        $payment = SubscriptionPayment::create([
            'company_id' => $company->id, 'requested_by' => $request->user()->id, 'from_tier' => $company->plan_tier, 'to_tier' => $data['to_tier'],
            'amount' => $amount, 'payment_reference' => $data['payment_reference'], 'receipt_reference' => $data['receipt_reference'],
            'proof_path' => $request->file('proof')->store('subscription-proofs', 'local'), 'terms_accepted_at' => now(),
        ]);

        $label = Plans::tier($data['to_tier'])['label'];
        $notice = new ApprovalNotice("{$company->name} paid for an upgrade to {$label}", 'warning', '/platform/companies', null, $payment->id);
        User::role(Roles::SUPER_ADMIN)->where('is_active', true)->get()->each(fn (User $u) => $u->notify($notice));

        return response()->json(['data' => self::payment($payment)], 201);
    }

    /** The photo of the receipt: only the company that paid (the scope) and the super admin may open it. */
    public function proof(SubscriptionPayment $payment): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($payment->proof_path), 404);

        return Storage::disk('local')->response($payment->proof_path);
    }

    /** @return array<string, mixed> */
    public static function payment(SubscriptionPayment $p): array
    {
        return [
            'id' => $p->id, 'company_id' => $p->company_id, 'from_tier' => $p->from_tier, 'to_tier' => $p->to_tier, 'amount' => $p->amount,
            'payment_reference' => $p->payment_reference, 'receipt_reference' => $p->receipt_reference, 'status' => $p->status,
            'terms_accepted_at' => $p->terms_accepted_at?->toIso8601String(), 'submitted_at' => $p->created_at?->toIso8601String(),
            'decided_at' => $p->decided_at?->toIso8601String(), 'decision_remarks' => $p->decision_remarks,
            'proof_url' => route('api.subscription.payments.proof', $p),
        ];
    }

    private function company(Request $request): Company
    {
        return $request->user()->company ?? abort(404, 'This account is not linked to a company.');
    }
}
