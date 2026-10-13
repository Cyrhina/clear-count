<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Loan;
use App\Models\LoanType;
use App\Support\ActivityLogger;
use App\Support\LoanDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Loan types, the loans employees repay through payroll, and their status. Repayments are written by payroll (LoanLedger), not here. */
class LoanController extends Controller
{
    // ---- Types ---------------------------------------------------------------------------------------------------

    public function types(Request $request): JsonResponse
    {
        LoanDefaults::ensure($request->user()->company_id);

        return response()->json(['data' => LoanType::orderBy('id')->get()]);
    }

    public function storeType(Request $request): JsonResponse
    {
        LoanDefaults::ensure($request->user()->company_id);
        $data = $this->typeRules($request);
        $companyId = $request->user()->company_id;
        $slug = trim(preg_replace('/[^a-z0-9]+/', '_', mb_strtolower($data['label'])), '_') ?: 'loan';
        $taken = LoanType::pluck('key')->all();
        $key = "custom_{$slug}";
        for ($i = 2; in_array($key, $taken, true); $i++) {
            $key = "custom_{$slug}_{$i}";
        }

        $type = LoanType::create([...$data, 'company_id' => $companyId, 'key' => $key, 'is_active' => true, 'built_in' => false]);
        ActivityLogger::log(module: 'Loans', action: 'Added', title: 'Loan type', description: $type->label, subject: $type);

        return response()->json(['data' => $type], 201);
    }

    public function updateType(Request $request, LoanType $loanType): JsonResponse
    {
        $data = $this->typeRules($request, partial: true);
        $loanType->update($data);
        ActivityLogger::log(module: 'Loans', action: 'Updated', title: 'Loan type', description: $loanType->label, subject: $loanType);

        return response()->json(['data' => $loanType]);
    }

    /** Deletes a company-defined type no loan uses. A built-in type, or one in use, is deactivated instead. */
    public function destroyType(LoanType $loanType): JsonResponse
    {
        if ($loanType->built_in) {
            return response()->json(['message' => 'A built-in loan type cannot be deleted. Deactivate it instead.'], 422);
        }
        $used = Loan::where('type', $loanType->key)->count();
        if ($used > 0) {
            return response()->json(['message' => "{$loanType->label} is used by {$used} loan".($used === 1 ? '' : 's').'. Deactivate it instead.'], 422);
        }
        $loanType->delete();

        return response()->json(['data' => ['deleted' => true]]);
    }

    /** @return array<string, mixed> */
    private function typeRules(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'label' => [$required, 'string', 'max:120'],
            'provider' => [$required, Rule::in(['SSS', 'Pag-IBIG', 'Company', 'Other'])],
            'description' => ['nullable', 'string', 'max:255'],
            'typical_term' => ['nullable', 'string', 'max:120'],
            'typical_amount' => ['nullable', 'string', 'max:120'],
            'amount_type' => ['sometimes', Rule::in(['fixed', 'custom'])],
            'fixed_principal' => ['nullable', 'numeric', 'gt:0', 'max:100000000'],
            'fixed_monthly_deduction' => ['nullable', 'numeric', 'gt:0', 'max:100000000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    // ---- Loans ---------------------------------------------------------------------------------------------------

    public function index(): JsonResponse
    {
        return response()->json(['data' => Loan::with('repayments')->orderByDesc('id')->get()->map(fn (Loan $l) => $this->present($l))]);
    }

    public function store(Request $request): JsonResponse
    {
        LoanDefaults::ensure($request->user()->company_id);
        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
            'type' => ['required', 'string', Rule::exists('loan_types', 'key')->where('company_id', $request->user()->company_id)],
            'label' => ['required', 'string', 'max:120'],
            'principal' => ['required', 'numeric', 'gt:0', 'max:100000000'],
            'monthly_deduction' => ['required', 'numeric', 'gt:0', 'max:100000000'],
            'start_date' => ['required', 'date_format:Y-m-d'],
        ]);
        $employee = Employee::findOrFail($data['employee_id']);
        $loan = Loan::create([...$data, 'company_id' => $employee->company_id, 'status' => 'active']);
        ActivityLogger::log(module: 'Loans', action: 'Added', title: 'Loan', description: "{$loan->label} for {$employee->name}", subject: $loan);

        return response()->json(['data' => $this->present($loan->load('repayments'))], 201);
    }

    /** Adds loans of one type for several employees. A fixed type gives everyone its own amounts; anyone with a live loan of the type is skipped. */
    public function storeMany(Request $request): JsonResponse
    {
        LoanDefaults::ensure($request->user()->company_id);
        $data = $request->validate([
            'loan_type_id' => ['required', 'integer'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'entries' => ['required', 'array', 'min:1', 'max:500'],
            'entries.*.employee_id' => ['required', 'integer'],
            'entries.*.principal' => ['nullable', 'numeric', 'min:0', 'max:100000000'],
            'entries.*.monthly_deduction' => ['nullable', 'numeric', 'min:0', 'max:100000000'],
        ]);
        $type = LoanType::findOrFail($data['loan_type_id']);
        $allowed = Employee::whereIn('id', array_column($data['entries'], 'employee_id'))->where('status', 'active')->pluck('company_id', 'id');

        $added = 0;
        $skipped = 0;
        foreach ($data['entries'] as $entry) {
            $id = $entry['employee_id'];
            $principal = $type->amount_type === 'fixed' ? (float) $type->fixed_principal : (float) ($entry['principal'] ?? 0);
            $deduction = $type->amount_type === 'fixed' ? (float) $type->fixed_monthly_deduction : (float) ($entry['monthly_deduction'] ?? 0);
            $live = Loan::where('employee_id', $id)->where('type', $type->key)->whereIn('status', ['active', 'suspended'])->exists();
            if (! isset($allowed[$id]) || $live || $principal <= 0 || $deduction <= 0) {
                $skipped++;

                continue;
            }
            Loan::create(['company_id' => $allowed[$id], 'employee_id' => $id, 'type' => $type->key, 'label' => $type->label, 'principal' => $principal, 'monthly_deduction' => $deduction, 'start_date' => $data['start_date'], 'status' => 'active']);
            $added++;
        }
        ActivityLogger::log(module: 'Loans', action: 'Added', title: 'Loans', description: "{$type->label}: {$added} employee(s) added");

        return response()->json(['data' => ['added' => $added, 'skipped' => $skipped]]);
    }

    /** Edits the terms. The principal and balance do not change once a loan exists. */
    public function update(Request $request, Loan $loan): JsonResponse
    {
        LoanDefaults::ensure($request->user()->company_id);
        if (in_array($loan->status, ['completed', 'cancelled'], true)) {
            return response()->json(['message' => 'A completed or cancelled loan cannot be changed.'], 422);
        }
        $data = $request->validate([
            'type' => ['sometimes', 'string', Rule::exists('loan_types', 'key')->where('company_id', $request->user()->company_id)],
            'label' => ['sometimes', 'string', 'max:120'],
            'monthly_deduction' => ['sometimes', 'numeric', 'gt:0', 'max:100000000'],
            'start_date' => ['sometimes', 'date_format:Y-m-d'],
        ]);
        $loan->update($data);
        ActivityLogger::log(module: 'Loans', action: 'Updated', title: 'Loan', description: $loan->label, subject: $loan);

        return response()->json(['data' => $this->present($loan->load('repayments'))]);
    }

    /** Pause (suspended), resume (active) or cancel. Payroll only deducts active loans; completed and cancelled are final. */
    public function setStatus(Request $request, Loan $loan): JsonResponse
    {
        $status = $request->validate(['status' => ['required', Rule::in(['active', 'suspended', 'cancelled'])]])['status'];
        if (in_array($loan->status, ['completed', 'cancelled'], true)) {
            return response()->json(['message' => 'A completed or cancelled loan cannot be changed.'], 422);
        }
        $loan->update(['status' => $status]);
        ActivityLogger::log(module: 'Loans', action: 'Updated', title: 'Loan', description: "{$loan->label} set to {$status}", subject: $loan);

        return response()->json(['data' => $this->present($loan->load('repayments'))]);
    }

    /** @return array<string, mixed> */
    private function present(Loan $loan): array
    {
        $paid = (float) $loan->repayments->sum('amount');

        return [
            'id' => $loan->id, 'employee_id' => $loan->employee_id, 'type' => $loan->type, 'label' => $loan->label, 'principal' => $loan->principal,
            'balance' => round($loan->principal - $paid, 2), 'monthly_deduction' => $loan->monthly_deduction, 'start_date' => $loan->start_date->toDateString(), 'status' => $loan->status,
            'repayment_history' => $loan->repayments->map(fn ($r) => ['id' => $r->id, 'date' => $r->paid_on->toDateString(), 'payroll_reference' => $r->payroll_reference ?? '', 'amount' => $r->amount,
                'remaining_balance_after' => round($loan->principal - $loan->repayments->where('id', '<=', $r->id)->sum('amount'), 2)])->values(),
        ];
    }
}
