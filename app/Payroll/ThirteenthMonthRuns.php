<?php

namespace App\Payroll;

use App\Exceptions\ConflictException;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\ThirteenthMonthLine;
use App\Models\ThirteenthMonthRun;
use App\Models\User;
use App\Payroll\Statutory\StatutoryCalculator;
use App\Payroll\Statutory\StatutoryTables;
use Illuminate\Support\Facades\DB;

/**
 * 13th month batches: who a batch covers (preview), generating it (replaces the draft with the same year and recipients; never pays anyone a
 * second time in a year once a batch with them is finalized), and finalizing (locks it; a finalized batch answers 409 to anything else).
 * The computation is `ThirteenthMonth`; this class reads the database and writes the lines.
 */
final class ThirteenthMonthRuns
{
    /**
     * @param  array{mode: string, employee_ids?: list<int>, payroll_group_id?: int|null, department?: string|null}  $selection
     * @return array{coverage: array{start: string, end: string}, eligible: list<array>, included: list<array>, skipped: list<array>} employees in the domain shape
     */
    public static function preview(int $companyId, int $year, array $selection): array
    {
        $coverage = ThirteenthMonth::coverageFor($year);
        $employees = self::employees($companyId);
        $eligible = array_values(array_filter($employees, fn ($e) => ThirteenthMonth::isEligible($e, $coverage)));
        $matched = ThirteenthMonth::applySelection($eligible, self::selectionFor($selection), self::groupMembers($employees));
        $paid = self::paidEmployeeIds($companyId, $year);

        return [
            'coverage' => $coverage, 'eligible' => $eligible,
            'included' => array_values(array_filter($matched, fn ($e) => ! in_array($e['id'], $paid, true))),
            'skipped' => array_values(array_filter($matched, fn ($e) => in_array($e['id'], $paid, true))),
        ];
    }

    /**
     * @param  array{year: int, generation_date: string, payout_period_label: string, selection: array}  $data
     * @return array{run: ThirteenthMonthRun, skipped: int}
     */
    public static function generate(int $companyId, array $data): array
    {
        return DB::transaction(function () use ($companyId, $data): array {
            $preview = self::preview($companyId, $data['year'], $data['selection']);
            $lines = self::lines($companyId, $preview['included'], $preview['coverage'], $data['generation_date']);

            $key = ThirteenthMonth::selectionKey(self::selectionFor($data['selection']));
            ThirteenthMonthRun::withoutGlobalScopes()->where('company_id', $companyId)->where('year', $data['year'])->where('status', 'draft')->get()
                ->filter(fn (ThirteenthMonthRun $r) => ThirteenthMonth::selectionKey(self::selectionFor($r->selection)) === $key)->each->delete();

            $run = ThirteenthMonthRun::create([
                'company_id' => $companyId, 'year' => $data['year'], 'generation_date' => $data['generation_date'], 'payout_period_label' => $data['payout_period_label'],
                'selection' => $data['selection'], 'coverage_start' => $preview['coverage']['start'], 'coverage_end' => $preview['coverage']['end'], 'status' => 'draft',
            ]);
            foreach ($lines as $line) {
                ThirteenthMonthLine::create([
                    'company_id' => $companyId, 'thirteenth_month_run_id' => $run->id, 'employee_id' => (int) $line['employeeId'], 'active_from' => $line['activeFrom'], 'active_to' => $line['activeTo'],
                    'separated' => $line['separated'], 'months_credited' => $line['monthsCredited'], 'gross_basic_earned' => $line['grossBasicEarned'], 'undertime_hours' => $line['undertimeHours'],
                    'undertime_deduction' => $line['undertimeDeduction'], 'unpaid_absence_days' => $line['unpaidAbsenceDays'], 'absence_deduction' => $line['absenceDeduction'],
                    'annual_basic_earned' => $line['annualBasicEarned'], 'thirteenth_month_pay' => $line['thirteenthMonthPay'], 'taxable_excess' => $line['taxableExcess'],
                    'withholding_tax' => $line['withholdingTax'], 'net_pay' => $line['netPay'], 'breakdown' => $line,
                ]);
            }

            return ['run' => $run, 'skipped' => count($preview['skipped'])];
        });
    }

    /** Issues the batch's payslips and locks it. Only a draft can be finalized. */
    public static function finalize(ThirteenthMonthRun $run, User $by): ThirteenthMonthRun
    {
        return DB::transaction(function () use ($run, $by): ThirteenthMonthRun {
            $current = ThirteenthMonthRun::withoutGlobalScopes()->lockForUpdate()->findOrFail($run->id);
            if ($current->status !== 'draft') {
                throw new ConflictException('This batch is already finalized.');
            }
            // Someone paid in a batch finalized meanwhile must not be paid again.
            $paid = self::paidEmployeeIds($current->company_id, $current->year);
            if ($current->lines()->whereIn('employee_id', $paid)->exists()) {
                throw new ConflictException('An employee in this batch was paid 13th month pay for the year in another batch. Generate it again.');
            }
            $current->update(['status' => 'finalized', 'finalized_by' => $by->id, 'finalized_at' => now()]);

            return $current->refresh();
        });
    }

    /** The batch's selection as the engine takes it (camelCase). */
    private static function selectionFor(array $selection): array
    {
        return array_filter([
            'mode' => $selection['mode'], 'employeeIds' => isset($selection['employee_ids']) ? array_map('strval', $selection['employee_ids']) : null,
            'payrollGroupId' => isset($selection['payroll_group_id']) ? (string) $selection['payroll_group_id'] : null, 'department' => $selection['department'] ?? null,
        ], fn ($v) => $v !== null);
    }

    /** @return list<array> every employee of the company in the domain shape (current pay rate: see the shortcut in ThirteenthMonth) */
    private static function employees(int $companyId): array
    {
        return Employee::withoutGlobalScopes()->where('company_id', $companyId)->orderBy('id')->get()->map(fn (Employee $e) => [
            'id' => (string) $e->id, 'payrollGroupId' => $e->payroll_group_id ? (string) $e->payroll_group_id : null, 'personal' => $e->personal ?? [], 'employment' => $e->employment ?? [],
            'compensation' => ['allowances' => [], ...($e->compensation ?? [])], 'government' => $e->government ?? [],
        ])->all();
    }

    /** @return array<string, list<string>> payroll group id => employee ids */
    private static function groupMembers(array $employees): array
    {
        $members = [];
        foreach ($employees as $e) {
            if ($e['payrollGroupId']) {
                $members[$e['payrollGroupId']][] = $e['id'];
            }
        }

        return $members;
    }

    /** @return list<string> employees already in a finalized batch of the year */
    private static function paidEmployeeIds(int $companyId, int $year): array
    {
        return ThirteenthMonthLine::withoutGlobalScopes()->where('company_id', $companyId)
            ->whereIn('thirteenth_month_run_id', ThirteenthMonthRun::withoutGlobalScopes()->where('company_id', $companyId)->where('year', $year)->where('status', 'finalized')->select('id'))
            ->pluck('employee_id')->map(fn ($id) => (string) $id)->all();
    }

    /**
     * @param  list<array>  $employees
     * @return list<array> engine lines, one per employee employed in the coverage
     */
    private static function lines(int $companyId, array $employees, array $coverage, string $generationDate): array
    {
        $ids = array_column($employees, 'id');
        $attendance = AttendanceRecord::withoutGlobalScopes()->where('attendance_records.company_id', $companyId)->whereIn('attendance_records.employee_id', $ids)->whereIn('attendance_records.status', ['undertime', 'absent'])
            ->whereBetween('attendance_records.date', [$coverage['start'], $coverage['end']])->leftJoin('work_schedules', 'work_schedules.id', '=', 'attendance_records.work_schedule_id')
            ->get(['attendance_records.employee_id', 'attendance_records.date', 'attendance_records.status', 'attendance_records.time_out', 'work_schedules.end_time as schedule_end'])
            ->groupBy('employee_id');
        $leaves = LeaveRequest::withoutGlobalScopes()->where('company_id', $companyId)->whereIn('employee_id', $ids)->where('status', 'approved')
            ->whereDate('date_from', '<=', $coverage['end'])->whereDate('date_to', '>=', $coverage['start'])
            ->whereIn('leave_type_id', DB::table('leave_types')->where('company_id', $companyId)->where('is_paid', true)->select('id'))->get()->groupBy('employee_id');
        $config = StatutoryTables::for($companyId, $generationDate);

        $lines = [];
        foreach ($employees as $employee) {
            $line = ThirteenthMonth::computeLine([
                'employee' => $employee, 'coverage' => $coverage,
                'attendance' => ($attendance[$employee['id']] ?? collect())->map(fn ($r) => ['date' => $r->date->toDateString(), 'status' => $r->status, 'timeOut' => $r->time_out, 'scheduleEndTime' => $r->schedule_end])->all(),
                'paidLeaves' => ($leaves[$employee['id']] ?? collect())->map(fn ($l) => ['dateFrom' => $l->date_from->toDateString(), 'dateTo' => $l->date_to->toDateString(), 'dayPortion' => $l->day_portion])->all(),
                'annualMarginalRate' => StatutoryCalculator::monthlyFor($config, RateBasis::monthlyEquivalent($employee), null, 1, (float) ($employee['government']['pagibigEmployeeContribution'] ?? 0))['annual_marginal_rate'],
            ]);
            if ($line) {
                $lines[] = $line;
            }
        }

        return $lines;
    }
}
