<?php

namespace App\Http\Controllers;

use App\Exceptions\ConflictException;
use App\Models\BonusIncentive;
use App\Models\Employee;
use App\Support\ActivityLogger;
use App\Support\Approval;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Bonuses and incentives: draft, submit for approval, decide. Payroll pays the approved ones by period label (P10). */
class BonusController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => BonusIncentive::with('decider:id,name')->orderByDesc('id')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->rules($request);
        $bonus = BonusIncentive::create(['status' => 'draft', ...$data, 'company_id' => $request->user()->company_id, 'created_by' => $request->user()->id]);
        ActivityLogger::log(module: 'Bonuses', action: 'Added', title: 'Bonus', description: $bonus->name, subject: $bonus);

        return response()->json(['data' => $bonus], 201);
    }

    /** Only a draft or a pending bonus can be edited; a decided one is locked. */
    public function update(Request $request, BonusIncentive $bonus): JsonResponse
    {
        if (! in_array($bonus->status, ['draft', 'pending'], true)) {
            throw new ConflictException('A decided bonus cannot be edited.');
        }
        $bonus->update($this->rules($request));
        ActivityLogger::log(module: 'Bonuses', action: 'Updated', title: 'Bonus', description: $bonus->name, subject: $bonus);

        return response()->json(['data' => $bonus]);
    }

    public function submit(BonusIncentive $bonus): JsonResponse
    {
        if ($bonus->status !== 'draft') {
            throw new ConflictException('Only a draft can be submitted for approval.');
        }
        $bonus->update(['status' => 'pending']);
        ActivityLogger::log(module: 'Bonuses', action: 'Submitted', title: 'Bonus', description: $bonus->name, subject: $bonus);

        return response()->json(['data' => $bonus]);
    }

    public function decide(Request $request, BonusIncentive $bonus): JsonResponse
    {
        $decision = $request->validate(['decision' => ['required', Rule::in(['approved', 'rejected'])]])['decision'];
        Approval::decide($bonus, $decision, $request->user());
        ActivityLogger::log(module: 'Bonuses', action: ucfirst($decision), title: 'Bonus', description: $bonus->name, subject: $bonus);

        return response()->json(['data' => $bonus->fresh()]);
    }

    /** @return array<string, mixed> */
    private function rules(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'bonus_type' => ['required', Rule::in(['fixed_amount', 'percentage', 'performance_based', 'output_based'])],
            'target_type' => ['required', Rule::in(['employee', 'employees', 'department', 'company'])],
            'target_employee_id' => ['nullable', 'integer'],
            'target_employee_ids' => ['nullable', 'array', 'max:500'],
            'target_employee_ids.*' => ['integer'],
            'target_department' => ['nullable', 'string', 'max:120'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:100000000'],
            'period_label' => ['required', 'string', 'max:80'],
            'taxable' => ['required', 'boolean'],
            'frequency' => ['required', Rule::in(['one_time', 'recurring'])],
            'payout_mode' => ['required', Rule::in(['regular_payroll', 'separate_payslip'])],
            'notes' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['draft', 'pending'])],
        ]);
        if ($data['bonus_type'] === 'percentage' && $data['amount'] > 100) {
            throw ValidationException::withMessages(['amount' => ['A percentage cannot be more than 100.']]);
        }

        // Keep only the target the type uses, and check it exists (the employee scope hides other companies' people).
        $target = match ($data['target_type']) {
            'employee' => ['target_employee_id' => $this->employeeIds([$data['target_employee_id'] ?? null], 'target_employee_id')[0], 'target_employee_ids' => null, 'target_department' => null],
            'employees' => ['target_employee_id' => null, 'target_employee_ids' => $this->employeeIds($data['target_employee_ids'] ?? [], 'target_employee_ids'), 'target_department' => null],
            'department' => ['target_employee_id' => null, 'target_employee_ids' => null, 'target_department' => ($data['target_department'] ?? null) ?: throw ValidationException::withMessages(['target_department' => ['Choose a department.']])],
            'company' => ['target_employee_id' => null, 'target_employee_ids' => null, 'target_department' => null],
        };

        return [...$data, ...$target];
    }

    /**
     * @param  list<int|null>  $ids
     * @return list<int>
     */
    private function employeeIds(array $ids, string $field): array
    {
        $ids = array_values(array_unique(array_filter($ids)));
        if ($ids === [] || Employee::whereIn('id', $ids)->count() !== count($ids)) {
            throw ValidationException::withMessages([$field => ['Choose the employees this bonus is for.']]);
        }

        return $ids;
    }
}
