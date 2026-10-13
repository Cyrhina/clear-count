<?php

namespace App\Http\Controllers;

use App\Models\DeductionPlan;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Recurring-deduction plans (cooperative savings, union dues), one-time deductions, and what each employee has. Loans are separate. */
class DeductionController extends Controller
{
    // ---- Plans ---------------------------------------------------------------------------------------------------

    public function plans(): JsonResponse
    {
        return response()->json(['data' => DeductionPlan::orderBy('name')->get()]);
    }

    public function storePlan(Request $request): JsonResponse
    {
        $data = $this->planRules($request);
        $this->assertNameFree($data['name']);

        $plan = DeductionPlan::create([...$data, 'company_id' => $request->user()->company_id, 'status' => 'active']);
        ActivityLogger::log(module: 'Deductions', action: 'Added', title: 'Deduction plan', description: $plan->name, subject: $plan);

        return response()->json(['data' => $plan], 201);
    }

    /** Updates the plan and carries the change to everyone still enrolled; a custom plan keeps each employee's own amount. */
    public function updatePlan(Request $request, DeductionPlan $deductionPlan): JsonResponse
    {
        $data = $this->planRules($request, partial: true);
        if (isset($data['name'])) {
            $this->assertNameFree($data['name'], $deductionPlan->id);
        }

        $enrolled = DB::transaction(function () use ($deductionPlan, $data): int {
            $deductionPlan->update($data);
            $live = EmployeeDeduction::where('deduction_plan_id', $deductionPlan->id)->whereIn('status', ['active', 'paused'])->get();
            foreach ($live as $d) {
                $d->update(['name' => $deductionPlan->name, 'reason' => $deductionPlan->reason, ...($deductionPlan->amount_type === 'custom' ? [] : ['amount' => $deductionPlan->amount])]);
            }

            return $live->count();
        });
        ActivityLogger::log(module: 'Deductions', action: 'Updated', title: 'Deduction plan', description: "{$deductionPlan->name} ({$enrolled} enrolled updated)", subject: $deductionPlan);

        return response()->json(['data' => $deductionPlan, 'updated_enrollments' => $enrolled]);
    }

    public function setPlanStatus(Request $request, DeductionPlan $deductionPlan): JsonResponse
    {
        $status = $request->validate(['status' => ['required', Rule::in(['active', 'archived'])]])['status'];
        $live = EmployeeDeduction::where('deduction_plan_id', $deductionPlan->id)->whereIn('status', ['active', 'paused'])->count();
        if ($status === 'archived' && $live > 0) {
            return response()->json(['message' => "{$deductionPlan->name} still has {$live} enrolled employee".($live === 1 ? '' : 's').'. Cancel or move them first.'], 422);
        }
        $deductionPlan->update(['status' => $status]);

        return response()->json(['data' => $deductionPlan]);
    }

    // ---- What employees have -------------------------------------------------------------------------------------

    public function index(): JsonResponse
    {
        return response()->json(['data' => EmployeeDeduction::orderByDesc('id')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['required', Rule::in(['recurring', 'one_time'])],
            'amount' => ['required', 'numeric', 'gt:0', 'max:100000000'],
            'start_date' => ['required_if:kind,recurring', 'nullable', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'due_date' => ['required_if:kind,one_time', 'nullable', 'date_format:Y-m-d'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);
        $employee = Employee::findOrFail($data['employee_id']);
        $deduction = EmployeeDeduction::create([...$data, 'company_id' => $employee->company_id, 'status' => 'active']);
        ActivityLogger::log(module: 'Deductions', action: 'Added', title: 'Employee deduction', description: "{$deduction->name} for {$employee->name}", subject: $deduction);

        return response()->json(['data' => $deduction], 201);
    }

    /** Edits a deduction or changes its status (pause, resume, cancel). A cancelled or completed one is final. */
    public function update(Request $request, EmployeeDeduction $employeeDeduction): JsonResponse
    {
        if (in_array($employeeDeduction->status, ['cancelled', 'completed'], true)) {
            return response()->json(['message' => 'A cancelled or completed deduction cannot be changed.'], 422);
        }
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'amount' => ['sometimes', 'numeric', 'gt:0', 'max:100000000'],
            'start_date' => ['nullable', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d'],
            'due_date' => ['nullable', 'date_format:Y-m-d'],
            'status' => ['sometimes', Rule::in(['active', 'paused', 'cancelled'])],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);
        $employeeDeduction->update($data);
        ActivityLogger::log(module: 'Deductions', action: 'Updated', title: 'Employee deduction', description: $employeeDeduction->name, subject: $employeeDeduction);

        return response()->json(['data' => $employeeDeduction]);
    }

    // ---- Bulk ----------------------------------------------------------------------------------------------------

    public function enroll(Request $request, DeductionPlan $deductionPlan): JsonResponse
    {
        $data = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'amounts' => ['nullable', 'array'],
            'amounts.*' => ['numeric', 'min:0', 'max:100000000'],
        ]);
        if ($deductionPlan->status !== 'active') {
            return response()->json(['data' => ['added' => 0, 'skipped' => count($data['employee_ids'])]]);
        }

        $allowed = Employee::whereIn('id', $data['employee_ids'])->where('status', 'active')->pluck('company_id', 'id');
        $added = 0;
        $skipped = 0;
        foreach (array_unique($data['employee_ids']) as $employeeId) {
            $already = EmployeeDeduction::where('employee_id', $employeeId)->where('deduction_plan_id', $deductionPlan->id)->whereIn('status', ['active', 'paused'])->exists();
            $amount = $deductionPlan->amount_type === 'custom' ? ($data['amounts'][$employeeId] ?? $deductionPlan->amount) : $deductionPlan->amount;
            if (! isset($allowed[$employeeId]) || $already || ! ($amount > 0)) {
                $skipped++;

                continue;
            }
            EmployeeDeduction::create([
                'company_id' => $allowed[$employeeId], 'employee_id' => $employeeId, 'deduction_plan_id' => $deductionPlan->id, 'name' => $deductionPlan->name, 'kind' => 'recurring',
                'amount' => $amount, 'start_date' => $data['start_date'], 'reason' => $deductionPlan->reason,
            ]);
            $added++;
        }
        ActivityLogger::log(module: 'Deductions', action: 'Enrolled', title: 'Deduction plan', description: "{$deductionPlan->name}: {$added} employee(s) added", subject: $deductionPlan);

        return response()->json(['data' => ['added' => $added, 'skipped' => $skipped]]);
    }

    /** Moves employees to another plan: the old deduction ends the day before the effective date, a new one starts on it. */
    public function transfer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from_plan_id' => ['required', 'integer'],
            'to_plan_id' => ['required', 'integer', 'different:from_plan_id'],
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'effective_date' => ['required', 'date_format:Y-m-d'],
        ]);
        $from = DeductionPlan::findOrFail($data['from_plan_id']);
        $to = DeductionPlan::findOrFail($data['to_plan_id']);
        if ($to->status !== 'active') {
            return response()->json(['data' => ['moved' => 0, 'skipped' => count($data['employee_ids'])]]);
        }

        $moved = 0;
        $skipped = 0;
        DB::transaction(function () use ($data, $from, $to, &$moved, &$skipped): void {
            foreach (array_unique($data['employee_ids']) as $employeeId) {
                $current = EmployeeDeduction::where('employee_id', $employeeId)->where('deduction_plan_id', $from->id)->whereIn('status', ['active', 'paused'])->first();
                $inTarget = EmployeeDeduction::where('employee_id', $employeeId)->where('deduction_plan_id', $to->id)->whereIn('status', ['active', 'paused'])->exists();
                if (! $current || $inTarget) {
                    $skipped++;

                    continue;
                }
                $start = $current->start_date?->toDateString();
                $current->update([
                    'status' => 'cancelled', 'end_date' => $start && $data['effective_date'] <= $start ? $start : date('Y-m-d', strtotime($data['effective_date'].' -1 day')),
                    'reason' => trim(($current->reason ? $current->reason.' ' : '')."Transferred to {$to->name} on {$data['effective_date']}."),
                ]);
                EmployeeDeduction::create([
                    'company_id' => $current->company_id, 'employee_id' => $employeeId, 'deduction_plan_id' => $to->id, 'name' => $to->name, 'kind' => 'recurring',
                    'amount' => $to->amount_type === 'custom' ? $current->amount : $to->amount, 'start_date' => $data['effective_date'], 'reason' => "Transferred from {$from->name}.",
                ]);
                $moved++;
            }
        });
        ActivityLogger::log(module: 'Deductions', action: 'Transferred', title: 'Deduction plan', description: "{$from->name} to {$to->name}: {$moved} employee(s)");

        return response()->json(['data' => ['moved' => $moved, 'skipped' => $skipped]]);
    }

    // ---- Helpers -------------------------------------------------------------------------------------------------

    /** @return array<string, mixed> */
    private function planRules(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:120'],
            'amount' => [$required, 'numeric', 'min:0', 'max:100000000'],
            'amount_type' => ['sometimes', Rule::in(['fixed', 'custom'])],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function assertNameFree(string $name, ?int $exceptId = null): void
    {
        $taken = DeductionPlan::whereRaw('lower(name) = ?', [mb_strtolower(trim($name))])->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))->exists();
        abort_if($taken, 422, "{$name} already exists.");
    }
}
