<?php

namespace App\Payroll;

use App\Models\AttendanceRecord;
use App\Models\BonusIncentive;
use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Models\EmployeeCompensation;
use App\Models\EmployeeDeduction;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Loan;
use App\Models\OvertimeRecord;
use App\Models\PayrollGroup;
use App\Models\WorkLog;
use App\Models\WorkSchedule;
use App\Payroll\Statutory\StatutoryTables;
use App\Support\LeaveDefaults;
use App\Support\PayrollDefaults;
use Illuminate\Support\Collection;

/**
 * Collects what one payroll period reads from the database, in the shapes `ComputeLine` takes (types/domain.ts, camelCase, string ids), and
 * runs the engine over the period's employees. Everything is queried for the company and the period directly, with no signed-in user, so a
 * console command or a queued job sees the same as a request.
 *
 * A period is `['id', 'label', 'startDate', 'endDate', 'payDate', 'payrollGroupId'?, 'excludedEmployeeIds'?]`.
 *
 * Work schedules count Sunday as 0 here (the database has Monday 1 to Sunday 7); pay rates come from the compensation row in force on the
 * period's last day; the statutory tables are the ones in force on the pay date.
 */
final class PayrollInputs
{
    /** The deduction entries the engine looks up by these names; the database types are named without "Contribution". */
    private const DEDUCTION_ALIAS = ['SSS' => 'SSS Contribution', 'PhilHealth' => 'PhilHealth Contribution', 'Pag-IBIG' => 'Pag-IBIG Contribution'];

    /**
     * One line per employee the run covers: active employees, plus anyone separated within the period (their final pay), limited to the
     * period's payroll group and without the employees held out of the run.
     *
     * @return list<array<string, mixed>>
     */
    public static function lines(int $companyId, array $period): array
    {
        $employees = self::employees($companyId, $period);
        $base = self::base($companyId, $period, array_column($employees, 'id'));

        return array_map(fn (array $employee) => ComputeLine::run([...$base, 'employee' => $employee]), $employees);
    }

    /**
     * @return list<array<string, mixed>> employees in the shape of types/domain.ts
     */
    public static function employees(int $companyId, array $period): array
    {
        $query = Employee::withoutGlobalScopes()->where('company_id', $companyId)->orderBy('id')
            ->where(fn ($q) => $q->where('status', 'active')->orWhere(fn ($q) => $q->where('status', '!=', 'active')->whereNotNull('employment->dateSeparated')
                ->where('employment->dateSeparated', '>=', $period['startDate'])->where('employment->dateSeparated', '<=', $period['endDate'])));
        if (! empty($period['payrollGroupId'])) {
            $query->where('payroll_group_id', $period['payrollGroupId']);
        }
        if (! empty($period['excludedEmployeeIds'])) {
            $query->whereNotIn('id', $period['excludedEmployeeIds']);
        }
        $employees = $query->get();

        $pay = EmployeeCompensation::withoutGlobalScopes()->where('company_id', $companyId)->whereIn('employee_id', $employees->pluck('id'))
            ->whereDate('effective_from', '<=', $period['endDate'])->orderBy('effective_from')->orderBy('id')->get()->groupBy('employee_id')->map->last();

        return $employees->map(function (Employee $e) use ($pay): array {
            $compensation = $e->compensation ?? [];
            if ($row = $pay->get($e->id)) {
                $compensation = [...$compensation, 'payType' => $row->rate_type, 'basicPay' => (float) $row->basic_rate, 'outputUnit' => $row->output_unit, 'allowances' => $row->allowances ?? []];
            }

            return [
                'id' => (string) $e->id, 'personal' => $e->personal ?? [], 'employment' => $e->employment ?? [], 'compensation' => [...$compensation, 'allowances' => $compensation['allowances'] ?? []],
                'government' => $e->government ?? [],
            ];
        })->all();
    }

    /**
     * Everything `ComputeLine` reads besides the employee.
     *
     * @param  list<string>  $employeeIds
     * @return array<string, mixed>
     */
    public static function base(int $companyId, array $period, array $employeeIds): array
    {
        $in = fn ($q) => $q->where('company_id', $companyId)->whereIn('employee_id', $employeeIds);
        $range = fn ($q, string $column) => $q->whereDate($column, '>=', $period['startDate'])->whereDate($column, '<=', $period['endDate']);
        LeaveDefaults::ensure($companyId);
        PayrollDefaults::ensureDeductions($companyId);

        $employeesOfGroup = Employee::withoutGlobalScopes()->where('company_id', $companyId)->whereNotNull('payroll_group_id')->get(['id', 'payroll_group_id'])->groupBy('payroll_group_id');

        return [
            'period' => [...$period, 'id' => (string) $period['id']],
            'config' => StatutoryTables::for($companyId, $period['payDate']),
            'groups' => PayrollGroup::withoutGlobalScopes()->where('company_id', $companyId)->get()->map(fn (PayrollGroup $g) => array_filter([
                'id' => (string) $g->id, 'frequency' => $g->frequency->value === 'bi_weekly' ? 'biweekly' : $g->frequency->value, 'workScheduleId' => $g->work_schedule_id ? (string) $g->work_schedule_id : null,
                'employeeIds' => ($employeesOfGroup[$g->id] ?? collect())->pluck('id')->map(fn ($id) => (string) $id)->all(),
            ], fn ($v) => $v !== null))->all(),
            'schedules' => WorkSchedule::withoutGlobalScopes()->where('company_id', $companyId)->orderBy('id')->get()->map(fn (WorkSchedule $s) => [
                'id' => (string) $s->id, 'daysOfWeek' => array_map(fn ($d) => $d % 7, $s->days_of_week ?? []),
            ])->all(),
            'attendanceRecords' => $range($in(AttendanceRecord::withoutGlobalScopes()), 'date')->get(['employee_id', 'date', 'status'])
                ->map(fn ($r) => ['employeeId' => (string) $r->employee_id, 'date' => $r->date->toDateString(), 'status' => $r->status])->all(),
            'leaveRequests' => $in(LeaveRequest::withoutGlobalScopes())->where('status', 'approved')->whereDate('date_from', '<=', $period['endDate'])->whereDate('date_to', '>=', $period['startDate'])->get()
                ->map(fn ($r) => ['employeeId' => (string) $r->employee_id, 'leaveTypeId' => (string) $r->leave_type_id, 'status' => $r->status, 'dateFrom' => $r->date_from->toDateString(), 'dateTo' => $r->date_to->toDateString(), 'dayPortion' => $r->day_portion])->all(),
            'leaveTypes' => LeaveType::withoutGlobalScopes()->where('company_id', $companyId)->get()->map(fn ($t) => ['id' => (string) $t->id, 'isPaid' => (bool) $t->is_paid])->all(),
            'overtimeRecords' => $range($in(OvertimeRecord::withoutGlobalScopes()), 'work_date')->where('status', 'approved')->get()
                ->map(fn ($r) => ['employeeId' => (string) $r->employee_id, 'date' => $r->work_date->toDateString(), 'status' => $r->status, 'type' => $r->type, 'hours' => $r->hours, 'multiplier' => $r->multiplier])->all(),
            'workLogs' => $range($in(WorkLog::withoutGlobalScopes()), 'work_date')->get()
                ->map(fn ($a) => ['id' => (string) $a->id, 'employeeId' => (string) $a->employee_id, 'workDate' => $a->work_date->toDateString(), 'status' => $a->status, 'quantity' => $a->quantity, 'payrollPeriodId' => $a->payroll_period_id ? (string) $a->payroll_period_id : null])->all(),
            'bonuses' => BonusIncentive::withoutGlobalScopes()->where('company_id', $companyId)->where('status', 'approved')->get()->map(fn ($b) => array_filter([
                'name' => $b->name, 'status' => $b->status, 'periodLabel' => $b->period_label, 'bonusType' => $b->bonus_type, 'targetType' => $b->target_type, 'amount' => $b->amount, 'taxable' => $b->taxable,
                'payoutMode' => $b->payout_mode, 'targetEmployeeId' => $b->target_employee_id ? (string) $b->target_employee_id : null, 'targetEmployeeIds' => $b->target_employee_ids, 'targetDepartment' => $b->target_department,
            ], fn ($v) => $v !== null))->all(),
            'benefits' => $in(EmployeeBenefit::withoutGlobalScopes())->where('status', 'active')->whereDate('start_date', '<=', $period['endDate'])
                ->where(fn ($q) => $q->whereNull('end_date')->orWhereDate('end_date', '>=', $period['startDate']))->get()->map(fn ($b) => array_filter([
                    'employeeId' => (string) $b->employee_id, 'status' => $b->status, 'startDate' => $b->start_date->toDateString(), 'endDate' => $b->end_date?->toDateString(), 'category' => $b->category,
                    'name' => $b->name, 'provider' => $b->provider, 'monthlyValue' => $b->monthly_value, 'employeeShare' => $b->employee_share,
                ], fn ($v) => $v !== null))->all(),
            'deductions' => $in(EmployeeDeduction::withoutGlobalScopes())->whereIn('status', ['active', 'completed'])->get()->map(fn ($d) => array_filter([
                'employeeId' => (string) $d->employee_id, 'name' => $d->name, 'kind' => $d->kind, 'status' => $d->status, 'amount' => $d->amount, 'startDate' => $d->start_date?->toDateString(),
                'endDate' => $d->end_date?->toDateString(), 'dueDate' => $d->due_date?->toDateString(), 'appliedPeriodId' => $d->settled_in_period_id ? (string) $d->settled_in_period_id : null,
            ], fn ($v) => $v !== null))->all(),
            'loans' => $in(Loan::withoutGlobalScopes())->where('status', 'active')->withSum('repayments', 'amount')->get()->map(fn ($l) => [
                'employeeId' => (string) $l->employee_id, 'type' => $l->type, 'label' => $l->label, 'status' => $l->status, 'startDate' => $l->start_date->toDateString(),
                'monthlyDeduction' => $l->monthly_deduction, 'balance' => round($l->principal - (float) $l->repayments_sum_amount, 2),
            ])->all(),
            'deductionConfigs' => self::deductionConfigs($companyId),
        ];
    }

    /** @return list<array<string, mixed>> */
    private static function deductionConfigs(int $companyId): array
    {
        /** @var Collection<int, DeductionType> $types */
        $types = DeductionType::withoutGlobalScopes()->where('company_id', $companyId)->get();

        return $types->map(fn (DeductionType $t) => array_filter([
            'name' => self::DEDUCTION_ALIAS[$t->name] ?? $t->name, 'allocationMethod' => $t->allocation_method, 'specificCutoffPeriod' => $t->specific_cutoff_period,
            'customSplitPercentages' => $t->custom_split_percentages,
        ], fn ($v) => $v !== null))->all();
    }
}
