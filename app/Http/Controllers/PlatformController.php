<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Models\SubscriptionPayment;
use App\Models\User;
use App\Notifications\ApprovalNotice;
use App\Support\Approval;
use App\Support\Plans;
use App\Support\Roles;
use App\Support\UserInvites;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** The super admin's side: every company, who is on the platform and the upgrade payments to verify. The route group requires `platform.admin`. */
class PlatformController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $companies = Company::orderByDesc('created_at')->orderByDesc('id')->get();
        $employees = Employee::withoutGlobalScopes()->get(['company_id', 'employment'])->reject(fn ($e) => ($e->employment['status'] ?? null) === 'archived');
        $perCompany = $employees->countBy('company_id');
        $users = User::with('roles')->get();

        return response()->json(['data' => [
            'totals' => [
                'users' => $users->count(), 'active_users' => $users->where('is_active', true)->count(), 'companies' => $companies->count(),
                'employees' => $employees->count(), 'active_employees' => $employees->filter(fn ($e) => ($e->employment['status'] ?? null) === 'active')->count(),
                'pending_payments' => SubscriptionPayment::where('status', 'pending')->count(),
            ],
            'users_by_role' => $users->flatMap(fn (User $u) => $u->getRoleNames())->countBy()
                ->map(fn ($count, $role) => ['role' => $role, 'label' => Roles::LABELS[$role] ?? $role, 'count' => $count])->sortByDesc('count')->values(),
            'employees_by_company' => $companies->map(fn (Company $c) => ['id' => $c->id, 'name' => $c->name, 'count' => $perCompany[$c->id] ?? 0])->values(),
            'recent_companies' => $companies->take(6)->map(fn (Company $c) => [...$this->company($c), 'employees' => $perCompany[$c->id] ?? 0])->values(),
            'activity' => ActivityLog::with('company:id,name')->latest()->latest('id')->limit(6)->get()->map(fn (ActivityLog $a) => [
                'id' => $a->id, 'title' => $a->title ?? $a->action, 'actor' => $a->actor, 'company' => $a->company?->name, 'created_at' => $a->created_at?->toIso8601String(),
            ]),
        ]]);
    }

    public function companies(): JsonResponse
    {
        $employees = Employee::withoutGlobalScopes()->get(['company_id', 'employment'])->reject(fn ($e) => ($e->employment['status'] ?? null) === 'archived')->countBy('company_id');
        $users = User::whereNotNull('company_id')->where('is_active', true)->pluck('company_id')->countBy();
        $pending = SubscriptionPayment::where('status', 'pending')->pluck('company_id')->all();
        $admins = User::role('company_admin')->orderBy('id')->get()->unique('company_id')->keyBy('company_id');

        $rows = Company::orderBy('name')->get()->map(fn (Company $c) => [
            ...$this->company($c), 'employees' => $employees[$c->id] ?? 0, 'users' => $users[$c->id] ?? 0, 'has_pending_payment' => in_array($c->id, $pending),
            'admin' => ($a = $admins[$c->id] ?? null) ? ['name' => $a->name, 'email' => $a->email, 'invite_pending' => $a->last_login_at === null] : null,
        ]);

        return response()->json(['data' => $rows]);
    }

    /** Onboards a company: the company, its head office, and the first company admin, who gets an invite email. */
    public function storeCompany(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'plan_tier' => ['required', Rule::in(Plans::order())],
            'admin_first_name' => ['required', 'string', 'max:100'],
            'admin_last_name' => ['required', 'string', 'max:100'],
            'admin_email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')],
        ]);

        $company = DB::transaction(function () use ($data) {
            $company = Company::create(['name' => $data['name'], 'plan_tier' => $data['plan_tier']]);
            $company->forceFill(['plan_renews_on' => now()->addMonth()->toDateString()])->save();
            $head = Branch::withoutGlobalScopes()->create(['company_id' => $company->id, 'name' => 'Head Office', 'code' => 'HO', 'is_head_office' => true]);
            UserInvites::create([
                'first_name' => $data['admin_first_name'], 'last_name' => $data['admin_last_name'], 'email' => $data['admin_email'],
                'company_id' => $company->id, 'branch_id' => $head->id, 'is_active' => true,
            ], 'company_admin');

            return $company;
        });

        return response()->json(['data' => $this->company($company)], 201);
    }

    public function setStatus(Request $request, Company $company): JsonResponse
    {
        $status = $request->validate(['status' => ['required', Rule::in(['active', 'suspended'])]])['status'];
        $company->forceFill(['status' => $status])->save();

        return response()->json(['data' => $this->company($company)]);
    }

    /** The super admin sets the plan directly: for Enterprise (quoted by hand) or to correct one. */
    public function setPlan(Request $request, Company $company): JsonResponse
    {
        $tier = $request->validate(['plan_tier' => ['required', Rule::in(Plans::order())]])['plan_tier'];
        $company->forceFill(['plan_tier' => $tier, 'plan_renews_on' => $company->plan_renews_on ?? now()->addMonth()->toDateString()])->save();

        return response()->json(['data' => $this->company($company)]);
    }

    /** Pending payments first (oldest first), then the decided ones. */
    public function payments(): JsonResponse
    {
        $rows = SubscriptionPayment::with('company:id,name')->orderByRaw("status = 'pending' desc")->orderBy('created_at')->limit(200)->get()
            ->map(fn (SubscriptionPayment $p) => [...SubscriptionController::payment($p), 'company_name' => $p->company?->name]);

        return response()->json(['data' => $rows]);
    }

    /** Confirming a payment moves the company to the new plan and starts a month; rejecting leaves the plan as it is. */
    public function decidePayment(Request $request, SubscriptionPayment $payment): JsonResponse
    {
        $data = $request->validate(['decision' => ['required', Rule::in(['approved', 'rejected'])], 'remarks' => ['nullable', 'string', 'max:255']]);

        Approval::decide($payment, $data['decision'], $request->user(), function (SubscriptionPayment $locked) {
            Company::whereKey($locked->company_id)->firstOrFail()->forceFill(['plan_tier' => $locked->to_tier, 'plan_renews_on' => now()->addMonth()->toDateString()])->save();
        });
        $payment->refresh()->forceFill(['decision_remarks' => $data['remarks'] ?? null])->save();

        $label = Plans::tier($payment->to_tier)['label'];
        $notice = $data['decision'] === 'approved'
            ? new ApprovalNotice("Your payment was confirmed. The company is now on the {$label} plan.", 'success', '/subscription', null, $payment->id)
            : new ApprovalNotice("Your upgrade payment to {$label} was rejected".($data['remarks'] ? ": {$data['remarks']}" : '.'), 'danger', '/subscription', null, $payment->id);
        User::where('company_id', $payment->company_id)->where('is_active', true)->permission('subscription.manage')->get()->each(fn (User $u) => $u->notify($notice));

        return response()->json(['data' => SubscriptionController::payment($payment)]);
    }

    /** @return array<string, mixed> */
    private function company(Company $c): array
    {
        return [
            'id' => $c->id, 'name' => $c->name, 'plan_tier' => $c->plan_tier, 'status' => $c->status, 'payroll_frequency' => $c->payroll_frequency,
            'plan_renews_on' => $c->plan_renews_on?->toDateString(), 'created_at' => $c->created_at?->toIso8601String(),
        ];
    }
}
