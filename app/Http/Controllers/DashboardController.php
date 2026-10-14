<?php

namespace App\Http\Controllers;

use App\Enums\PayrollFrequency;
use App\Models\AttendanceAdjustment;
use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRecord;
use App\Models\PayrollGroup;
use App\Models\PayrollLine;
use App\Models\PayrollPeriod;
use App\Models\WorkLog;
use App\Support\PayrollCalendar;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Throwable;

/**
 * The home dashboards, worked out from the live records. Every query goes through the model scopes, so what comes back is
 * what the signed-in role may see (a manager's branch, an employee's own record). Three payloads: `overview` (the admin and
 * HR cards), `payroll` and `workforce` (the HR charts).
 */
class DashboardController extends Controller
{
    private const TREND_MONTHS = 6;

    private const CHART_DAYS = 7;

    public function overview(): JsonResponse
    {
        $today = now()->toDateString();
        $employees = Employee::get(['id', 'status', 'name', 'department', 'employment', 'created_at']);
        $active = $employees->where('status', 'active');
        $day = $this->latestAttendanceDay($today);
        $present = $day ? AttendanceRecord::whereDate('date', $day)->where('status', '!=', 'absent')->count() : 0;

        $onLeaveToday = LeaveRequest::where('status', 'approved')->whereDate('date_from', '<=', $today)->whereDate('date_to', '>=', $today);
        $overtimeToday = OvertimeRecord::where('status', 'approved')->whereDate('work_date', $today);

        return response()->json(['data' => [
            'metrics' => [
                'total_employees' => $employees->count(),
                'active_employees' => $active->count(),
                'inactive_employees' => $employees->count() - $active->count(),
                'present_today' => $present,
                'attendance_rate' => $active->count() > 0 ? round($present / $active->count() * 100, 1) : 0,
                'on_leave_today' => (clone $onLeaveToday)->distinct()->count('employee_id'),
                'leave_approved' => (clone $onLeaveToday)->count(),
                'leave_pending' => LeaveRequest::where('status', 'pending')->count(),
                'overtime_employees' => (clone $overtimeToday)->distinct()->count('employee_id'),
                'overtime_hours' => round((float) (clone $overtimeToday)->sum('hours'), 1),
            ],
            'cycle' => $this->cycle(),
            'payroll_chart' => $this->payrollChart(),
            // The five most recent hires still active.
            'recent_employees' => $active->sortByDesc(fn (Employee $e) => $e->employment['dateHired'] ?? '')->take(5)->values()
                ->map(fn (Employee $e) => ['id' => $e->id, 'name' => $e->name, 'department' => $e->department, 'position' => $e->employment['position'] ?? '', 'date_hired' => $e->employment['dateHired'] ?? null])->all(),
        ]]);
    }

    public function payroll(): JsonResponse
    {
        $periods = PayrollPeriod::orderByDesc('start_date')->orderByDesc('id')->get();
        $focus = $periods->first(fn (PayrollPeriod $p) => $p->status !== 'finalized') ?? $periods->first();
        $lines = $focus ? PayrollLine::where('payroll_period_id', $focus->id)->get() : collect();
        $sum = fn (string $column) => round((float) $lines->sum($column), 2);
        $employer = round((float) $lines->sum(fn ($l) => $l->sss_employer + $l->philhealth_employer + $l->pagibig_employer), 2);
        $deductionItems = fn (string $key) => round((float) $lines->sum(fn ($l) => collect($l->breakdown[$key] ?? [])->sum('amount')), 2);

        $recent = $periods->take(6)->reverse()->values();
        $totalsByPeriod = PayrollLine::whereIn('payroll_period_id', $recent->pluck('id'))->selectRaw('payroll_period_id, sum(gross_pay) as g, sum(total_deductions) as d, sum(net_pay) as n')->groupBy('payroll_period_id')->get()->keyBy('payroll_period_id');
        $status = fn (string $s) => $periods->where('status', $s)->count();

        $workLogs = WorkLog::where('status', 'pending')->count();

        return response()->json(['data' => [
            'current' => $focus ? ['id' => $focus->id, 'payroll_number' => $focus->payroll_number, 'label' => $focus->label, 'status' => $focus->status, 'pay_date' => $focus->pay_date->toDateString(), 'employees' => $lines->count()] : null,
            'totals' => ['gross_pay' => $sum('gross_pay'), 'total_deductions' => $sum('total_deductions'), 'net_pay' => $sum('net_pay'), 'employer_contributions' => $employer, 'payroll_cost' => round($sum('gross_pay') + $employer, 2)],
            'counts' => ['periods' => $periods->count(), 'pending_runs' => $status('draft') + $status('review'), 'awaiting_approval' => $status('review'), 'approved_not_finalized' => $status('approved')],
            'pending_records' => ['work_logs' => $workLogs, 'overtime' => OvertimeRecord::where('status', 'pending')->count(), 'leave' => LeaveRequest::where('status', 'pending')->count(), 'adjustments' => AttendanceAdjustment::where('status', 'pending')->count()],
            'exceptions' => $this->exceptions($focus, $lines, $workLogs),
            'trend' => $recent->map(fn (PayrollPeriod $p) => ['run' => $p->payroll_number, 'gross_pay' => round((float) ($totalsByPeriod[$p->id]->g ?? 0), 2), 'deductions' => round((float) ($totalsByPeriod[$p->id]->d ?? 0), 2), 'net_pay' => round((float) ($totalsByPeriod[$p->id]->n ?? 0), 2)])->all(),
            'deduction_breakdown' => collect([
                ['SSS', $sum('sss_employee')], ['PhilHealth', $sum('philhealth_employee')], ['Pag-IBIG', $sum('pagibig_employee')], ['Withholding tax', $sum('withholding_tax')],
                ['Loans', $deductionItems('loanDeductions')], ['Other deductions', $deductionItems('otherDeductions')],
            ])->filter(fn ($d) => $d[1] > 0)->map(fn ($d) => ['name' => $d[0], 'value' => $d[1]])->values()->all(),
            'pipeline' => [['stage' => 'Draft', 'runs' => $status('draft')], ['stage' => 'In review', 'runs' => $status('review')], ['stage' => 'Approved', 'runs' => $status('approved')], ['stage' => 'Finalized', 'runs' => $status('finalized')]],
        ]]);
    }

    public function workforce(): JsonResponse
    {
        $days = AttendanceRecord::where('date', '<=', now()->toDateString())->distinct()->orderByDesc('date')->limit(self::CHART_DAYS)->pluck('date')->map(fn ($d) => substr((string) $d, 0, 10))->sort()->values();
        $records = $days->isEmpty() ? collect() : AttendanceRecord::whereIn('date', $days)->get(['date', 'status'])->groupBy(fn ($r) => $r->date->toDateString());
        $leaves = $days->isEmpty() ? collect() : LeaveRequest::where('status', 'approved')->whereDate('date_to', '>=', $days->first())->whereDate('date_from', '<=', $days->last())->get(['date_from', 'date_to']);

        $attendance = $days->map(function (string $date) use ($records, $leaves) {
            $day = $records->get($date, collect());
            $count = fn (string $status) => $day->where('status', $status)->count();

            return [
                'day' => CarbonImmutable::parse($date)->format('M j'), 'present' => $count('present'), 'late' => $count('late'), 'undertime' => $count('undertime'), 'absent' => $count('absent'),
                'on_leave' => $leaves->filter(fn ($l) => $l->date_from->toDateString() <= $date && $l->date_to->toDateString() >= $date)->count(),
            ];
        })->all();

        $headcount = Employee::get(['department', 'status'])->groupBy(fn ($e) => $e->department ?: 'Unassigned')
            ->map(fn ($group, $department) => ['department' => $department, 'active' => $group->where('status', 'active')->count(), 'inactive' => $group->where('status', '!=', 'active')->count()])
            ->sort(fn ($a, $b) => [$b['active'] + $b['inactive'], $a['department']] <=> [$a['active'] + $a['inactive'], $b['department']])->values()->all();

        return response()->json(['data' => ['attendance' => $attendance, 'headcount' => $headcount]]);
    }

    /** The most recent day up to today that has attendance records (today, or the last working day). */
    private function latestAttendanceDay(string $today): ?string
    {
        $max = AttendanceRecord::where('date', '<=', $today)->max('date');

        return $max ? substr((string) $max, 0, 10) : null;
    }

    /**
     * The pay period in progress: of the payroll groups, the one whose next pay date comes first (a company with no group is
     * taken as semi-monthly, 1st–15th and 16th–end, paid on the 15th and 30th). `release` is the pay date; `processing` is
     * three days after the cut-off, never later than the pay date.
     *
     * @return array<string, string>
     */
    private function cycle(): array
    {
        $groups = PayrollGroup::where('status', 'active')->get()->map(fn (PayrollGroup $g) => [$g->frequency, $g->cutoff_config, $g->pay_date_config]);
        $default = [PayrollFrequency::SemiMonthly, ['periods' => [['start_day' => 1, 'end_day' => 15], ['start_day' => 16, 'end_day' => 'end']]], ['type' => 'fixed_days', 'days' => [15, 30], 'weekend_rule' => 'previous']];

        $best = $this->nextPeriod($groups) ?? $this->nextPeriod(collect([$default]));

        return [...$best, 'processing' => min(CarbonImmutable::parse($best['cutoff'])->addDays(3)->toDateString(), $best['release'])];
    }

    /** The period with the earliest pay date still to come, over the given groups; a group whose rules cannot be read is skipped. */
    private function nextPeriod($groups): ?array
    {
        $today = now()->toDateString();
        $best = null;
        foreach ($groups as [$frequency, $cutoff, $payDates]) {
            try {
                $periods = [...PayrollCalendar::periods($frequency, $cutoff, $payDates, now()->year), ...PayrollCalendar::periods($frequency, $cutoff, $payDates, now()->year + 1)];
            } catch (Throwable) {
                continue;
            }
            $i = collect($periods)->search(fn ($p) => $p['pay_date'] >= $today);
            if ($i === false || ($best && $periods[$i]['pay_date'] >= $best['release'])) {
                continue;
            }
            $p = $periods[$i];
            $best = ['period_start' => $p['cutoff_start'], 'cutoff' => $p['cutoff_end'], 'release' => $p['pay_date'], 'next_cutoff' => $periods[$i + 1]['cutoff_end'] ?? $p['cutoff_end']];
        }

        return $best;
    }

    /** Gross and net of the finalized runs paid in each of the last six months that had one, oldest first. @return list<array<string, mixed>> */
    private function payrollChart(): array
    {
        $since = now()->startOfMonth()->subMonths(self::TREND_MONTHS - 1)->toDateString();
        $periods = PayrollPeriod::where('status', 'finalized')->whereDate('pay_date', '>=', $since)->get(['id', 'pay_date']);
        $byPeriod = PayrollLine::whereIn('payroll_period_id', $periods->pluck('id'))->selectRaw('payroll_period_id, sum(gross_pay) as g, sum(net_pay) as n')->groupBy('payroll_period_id')->get()->keyBy('payroll_period_id');

        return $periods->groupBy(fn (PayrollPeriod $p) => $p->pay_date->format('Y-m'))->sortKeys()->map(fn ($month, $key) => [
            'month' => CarbonImmutable::parse("{$key}-01")->format('M'),
            'gross_pay' => round((float) $month->sum(fn ($p) => $byPeriod[$p->id]->g ?? 0), 2),
            'net_pay' => round((float) $month->sum(fn ($p) => $byPeriod[$p->id]->n ?? 0), 2),
        ])->values()->all();
    }

    /** What looks wrong in the current run and in the people it pays. @return list<array<string, string>> */
    private function exceptions(?PayrollPeriod $focus, $lines, int $pendingWorkLogs): array
    {
        $out = [];
        $runTo = $focus ? "/payroll/{$focus->id}" : '/payroll';

        $lowNet = $lines->filter(fn ($l) => (float) $l->net_pay <= 0);
        if ($lowNet->isNotEmpty()) {
            $names = $lowNet->count() <= 2 ? ' ('.Employee::whereIn('id', $lowNet->pluck('employee_id'))->pluck('name')->implode(', ').')' : '';
            $out[] = ['id' => 'zero-net', 'message' => "{$lowNet->count()} employee".($lowNet->count() === 1 ? '' : 's')." with zero or negative net pay{$names}.", 'tone' => 'danger', 'to' => $runTo];
        }
        $held = count($focus?->excluded_employee_ids ?? []);
        if ($held > 0) {
            $out[] = ['id' => 'held', 'message' => "{$held} employee".($held === 1 ? ' is' : 's are').' held out of the current run.', 'tone' => 'warning', 'to' => $runTo];
        }

        $active = Employee::where('status', 'active')->get(['id', 'bank', 'government']);
        $noBank = $active->filter(fn ($e) => empty($e->bank['accountNumber'] ?? null))->count();
        if ($noBank > 0) {
            $out[] = ['id' => 'no-bank', 'message' => "{$noBank} active employee".($noBank === 1 ? ' has' : 's have').' no bank account on file.', 'tone' => 'warning', 'to' => $runTo];
        }
        $noGov = $active->filter(fn ($e) => collect(['sssNo', 'philhealthNo', 'pagibigNo', 'tinNo'])->contains(fn ($k) => empty($e->government[$k] ?? null)))->count();
        if ($noGov > 0) {
            $out[] = ['id' => 'no-gov', 'message' => "{$noGov} active employee".($noGov === 1 ? ' has' : 's have').' incomplete government ID numbers.', 'tone' => 'warning', 'to' => '/statutory'];
        }
        if ($pendingWorkLogs > 0) {
            $out[] = ['id' => 'pending-logs', 'message' => "{$pendingWorkLogs} hourly/output record".($pendingWorkLogs === 1 ? ' is' : 's are')." not approved yet and won't be paid until approved.", 'tone' => 'warning', 'to' => '/payroll-inputs'];
        }

        return $out;
    }
}
