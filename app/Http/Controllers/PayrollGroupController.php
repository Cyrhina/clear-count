<?php

namespace App\Http\Controllers;

use App\Enums\PayrollFrequency;
use App\Http\Requests\AssignEmployeesToPayrollGroupRequest;
use App\Http\Requests\StorePayrollGroupRequest;
use App\Http\Requests\UpdatePayrollGroupRequest;
use App\Http\Resources\PayrollGroupResource;
use App\Models\Employee;
use App\Models\PayrollGroup;
use App\Support\ActivityLogger;
use App\Support\PayrollCalendar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Payroll Groups sub-tab. Groups are scoped to the signed-in user's company by the model's global scope;
 * the route group requires `settings.payroll.edit`.
 */
class PayrollGroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'frequency' => ['nullable', Rule::enum(PayrollFrequency::class)],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $groups = PayrollGroup::query()
            // Counts and schedule names come with the list, so the cards need no extra queries.
            ->withCount('employees')
            ->with(['workSchedule:id,name', 'compensationType:id,name'])
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['frequency'] ?? null, fn ($q, $v) => $q->where('frequency', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('name', 'like', '%'.addcslashes($v, '%_\\').'%'))
            ->orderBy('name')
            ->get();

        return PayrollGroupResource::collection($groups)->response();
    }

    public function show(PayrollGroup $payrollGroup): JsonResponse
    {
        $payrollGroup->loadCount('employees')->load(['workSchedule:id,name', 'compensationType:id,name', 'employees' => fn ($q) => $q->orderBy('name')]);

        return (new PayrollGroupResource($payrollGroup))->response();
    }

    public function store(StorePayrollGroupRequest $request): JsonResponse
    {
        $group = PayrollGroup::create([...$request->validated(), 'company_id' => $request->user()->company_id]);
        ActivityLogger::log(module: 'Payroll', action: 'Added', title: 'Payroll group', description: $group->name, subject: $group);

        return (new PayrollGroupResource($this->fresh($group)))->response()->setStatusCode(201);
    }

    public function update(UpdatePayrollGroupRequest $request, PayrollGroup $payrollGroup): JsonResponse
    {
        $payrollGroup->update($request->validated());
        ActivityLogger::log(module: 'Payroll', action: 'Updated', title: 'Payroll group', description: $payrollGroup->name, subject: $payrollGroup);

        return (new PayrollGroupResource($this->fresh($payrollGroup)))->response();
    }

    /** A group that still has active employees cannot be deleted: payroll would have nobody to pay them through. */
    public function destroy(PayrollGroup $payrollGroup): JsonResponse
    {
        abort_unless(request()->user()->can('settings.payroll.edit'), 403);

        $active = $payrollGroup->employees()->where('status', 'active')->count();
        if ($active > 0) {
            return response()->json([
                'message' => "This group still has {$active} active employee".($active === 1 ? '' : 's').'. Move them to another payroll group first.',
            ], 422);
        }

        // Inactive employees are detached by the foreign key (nullOnDelete).
        $payrollGroup->delete();
        ActivityLogger::log(module: 'Payroll', action: 'Deleted', title: 'Payroll group', description: $payrollGroup->name);

        return response()->json(null, 204);
    }

    /** Moves employees into the group (taking them out of any other) or removes them from it. */
    public function assignEmployees(AssignEmployeesToPayrollGroupRequest $request, PayrollGroup $payrollGroup): JsonResponse
    {
        $ids = $request->validated('employee_ids');

        if ($request->action() === 'assign' && $payrollGroup->status !== 'active') {
            return response()->json(['message' => 'Employees cannot be assigned to an inactive payroll group.'], 422);
        }

        $changed = DB::transaction(fn () => $request->action() === 'assign'
            ? Employee::whereIn('id', $ids)->update(['payroll_group_id' => $payrollGroup->id])
            // Only those actually in this group: a stray id must not strip someone from another group.
            : Employee::whereIn('id', $ids)->where('payroll_group_id', $payrollGroup->id)->update(['payroll_group_id' => null]));

        ActivityLogger::log(
            module: 'Payroll',
            action: 'Updated',
            title: 'Payroll group assignment',
            description: "{$changed} employee".($changed === 1 ? '' : 's').($request->action() === 'assign' ? ' assigned to ' : ' removed from ').$payrollGroup->name,
            subject: $payrollGroup,
        );

        return response()->json([
            'data' => ['changed' => $changed, 'employees_count' => $payrollGroup->employees()->count()],
        ]);
    }

    /** Cutoff and pay dates for one year (default: this year), worked out from the group's rules. */
    public function calendar(Request $request, PayrollGroup $payrollGroup): JsonResponse
    {
        $validated = $request->validate(['year' => ['nullable', 'integer', 'min:2000', 'max:2100']]);
        $year = (int) ($validated['year'] ?? now()->year);

        return response()->json([
            'data' => PayrollCalendar::periods($payrollGroup->frequency, $payrollGroup->cutoff_config, $payrollGroup->pay_date_config, $year),
            'meta' => [
                'year' => $year,
                'group' => $payrollGroup->name,
                'frequency' => $payrollGroup->frequency->label(),
                'cutoff_display' => PayrollCalendar::cutoffDisplay($payrollGroup->frequency, $payrollGroup->cutoff_config),
                'pay_dates_display' => PayrollCalendar::payDatesDisplay($payrollGroup->pay_date_config),
            ],
        ]);
    }

    private function fresh(PayrollGroup $group): PayrollGroup
    {
        return $group->loadCount('employees')->load(['workSchedule:id,name', 'compensationType:id,name']);
    }
}
