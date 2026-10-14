<?php

namespace App\Http\Controllers;

use App\Models\AttendanceAdjustment;
use App\Models\AttendanceRecord;
use App\Models\BonusIncentive;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\OvertimeRecord;
use App\Models\PayrollPeriod;
use App\Models\WorkLog;
use App\Support\LeavePlanner;
use Illuminate\Http\JsonResponse;

/**
 * What a run reads for a period, read-only: attendance and overtime totals, output logs, and the other inputs (unpaid leave, allowances,
 * bonuses, attendance adjustments). Approvals happen in Attendance, Overtime, Leave and Approvals. Keys are camelCase because the rows are
 * built here for the screen, not taken from a model.
 */
class PayrollInputsController extends Controller
{
    private const BREAK_HOURS = 1;

    public function show(PayrollPeriod $period): JsonResponse
    {
        $from = $period->start_date->toDateString();
        $to = $period->end_date->toDateString();
        $people = Employee::where('status', 'active')->when($period->payroll_group_id, fn ($q) => $q->where('payroll_group_id', $period->payroll_group_id))->orderBy('id')->get()->keyBy('id');
        $ids = $people->keys()->all();
        $name = fn (Employee $e) => $e->name;

        $attendance = AttendanceRecord::withoutGlobalScopes()->whereIn('employee_id', $ids)->whereBetween('date', [$from, $to])->get()->groupBy('employee_id');
        $overtime = OvertimeRecord::withoutGlobalScopes()->whereIn('employee_id', $ids)->whereBetween('work_date', [$from, $to])->get();
        $leaves = LeaveRequest::withoutGlobalScopes()->whereIn('employee_id', $ids)->whereDate('date_from', '<=', $to)->whereDate('date_to', '>=', $from)->get();
        $workLogs = WorkLog::withoutGlobalScopes()->whereIn('employee_id', $ids)->whereBetween('work_date', [$from, $to])->get();
        $leaveTypes = LeaveType::withoutGlobalScopes()->where('company_id', $period->company_id)->get()->keyBy('id');
        $adjustments = AttendanceAdjustment::withoutGlobalScopes()->whereIn('employee_id', $ids)->with('record')->get()->filter(fn ($a) => $a->record && $a->record->date->between($from, $to));

        $time = $people->map(function (Employee $e) use ($attendance, $overtime, $name) {
            $mine = $attendance->get($e->id, collect());
            $ot = $overtime->where('employee_id', $e->id)->where('status', 'approved');

            return [
                'employeeId' => $e->id, 'employeeNumber' => $e->employee_number, 'name' => $name($e), 'department' => $e->department ?: '—',
                'daysPresent' => $mine->where('status', '!=', 'absent')->count(), 'regularHours' => round($mine->sum(fn ($r) => $this->workedHours($r->time_in, $r->time_out)), 2),
                'late' => $mine->where('status', 'late')->count(), 'undertime' => $mine->where('status', 'undertime')->count(), 'absent' => $mine->where('status', 'absent')->count(),
                'overtimeHours' => $ot->where('type', '!=', 'night_diff')->sum('hours'), 'nightDiffHours' => $ot->where('type', 'night_diff')->sum('hours'),
            ];
        })->filter(fn ($r) => $r['daysPresent'] + $r['absent'] + $r['overtimeHours'] + $r['nightDiffHours'] > 0)->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)->values();

        $output = $workLogs->where('type', 'output')->map(fn (WorkLog $a) => [
            'id' => $a->id, 'employeeId' => $a->employee_id, 'employeeNumber' => $people[$a->employee_id]->employee_number, 'name' => $name($people[$a->employee_id]), 'workDate' => $a->work_date->toDateString(),
            'description' => $a->description ?? '', 'unitLabel' => $a->unit_label, 'rate' => $a->rate, 'quantity' => $a->quantity, 'amount' => $a->amount,
            'status' => in_array($a->status, ['approved', 'rejected'], true) ? $a->status : 'pending', 'payrollNumber' => $a->payroll_period_id ? PayrollPeriod::withoutGlobalScopes()->whereKey($a->payroll_period_id)->value('payroll_number') : null,
        ])->sortBy([['workDate', 'asc'], ['name', 'asc']])->values();

        $other = collect();
        foreach ($leaves->where('status', 'approved') as $l) {
            $type = $leaveTypes->get($l->leave_type_id);
            if (! $type || $type->is_paid) {
                continue;
            }
            $e = $people[$l->employee_id];
            $days = $l->day_portion && $l->day_portion !== 'full' ? 0.5 : LeavePlanner::days($e, max($l->date_from->toDateString(), $from), min($l->date_to->toDateString(), $to), 'full');
            $other->push(['id' => "leave_{$l->id}", 'kind' => 'Leave without pay', 'employeeId' => $e->id, 'employeeNumber' => $e->employee_number, 'name' => $name($e), 'detail' => "{$type->name} · {$days} day".($days == 1 ? '' : 's'), 'status' => 'Approved']);
        }
        foreach ($people as $e) {
            foreach ($e->compensation['allowances'] ?? [] as $a) {
                $other->push(['id' => "{$e->id}_allow_{$a['label']}", 'kind' => 'Allowance', 'employeeId' => $e->id, 'employeeNumber' => $e->employee_number, 'name' => $name($e), 'detail' => $a['label'], 'amount' => $a['amount'], 'status' => 'Recurring']);
            }
        }
        foreach (BonusIncentive::withoutGlobalScopes()->where('company_id', $period->company_id)->whereRaw('lower(period_label) = ?', [mb_strtolower(trim($period->label))])->get() as $b) {
            $other->push(['id' => "bonus_{$b->id}", 'kind' => 'Bonus / incentive', 'name' => $b->name, 'detail' => str_replace('_', ' ', $b->bonus_type).' · '.($b->taxable ? 'taxable' : 'non-taxable'), 'amount' => $b->amount, 'status' => str_replace('_', ' ', $b->status)]);
        }
        foreach ($adjustments->where('status', 'approved') as $a) {
            $e = $people[$a->employee_id];
            $other->push(['id' => "adj_{$a->id}", 'kind' => 'Adjustment', 'employeeId' => $e->id, 'employeeNumber' => $e->employee_number, 'name' => $name($e), 'detail' => ($a->reason_category ?: 'Attendance correction').' · '.$a->record->date->toDateString(), 'status' => 'Approved']);
        }

        return response()->json(['data' => [
            'period' => ['id' => $period->id, 'label' => $period->label, 'startDate' => $from, 'endDate' => $to, 'payrollGroupId' => $period->payroll_group_id],
            'time' => $time,
            'output' => $output,
            'other' => $other->sortBy([['kind', 'asc'], ['name', 'asc']])->values(),
            'pending' => ['output' => $workLogs->where('status', 'pending')->count(), 'overtime' => $overtime->where('status', 'pending')->count(), 'leave' => $leaves->where('status', 'pending')->count(), 'adjustments' => $adjustments->where('status', 'pending')->count()],
        ]]);
    }

    /**
     * The attendance, overtime and work-log rows of the period as the Attendance, Overtime and Work Logs screens send them, for the
     * computation view: the payroll role may not open those screens.
     */
    public function records(PayrollPeriod $period): JsonResponse
    {
        $from = $period->start_date->toDateString();
        $to = $period->end_date->toDateString();
        $ids = Employee::when($period->payroll_group_id, fn ($q) => $q->where('payroll_group_id', $period->payroll_group_id))->pluck('id');

        return response()->json(['data' => [
            'attendance' => AttendanceRecord::withoutGlobalScopes()->whereIn('employee_id', $ids)->whereBetween('date', [$from, $to])->orderBy('date')->get(),
            'overtime' => OvertimeRecord::withoutGlobalScopes()->with('decider')->whereIn('employee_id', $ids)->whereBetween('work_date', [$from, $to])->orderBy('work_date')->get(),
            'work_logs' => WorkLog::withoutGlobalScopes()->with('decider')->whereIn('employee_id', $ids)->whereBetween('work_date', [$from, $to])->orderBy('work_date')->get(),
        ]]);
    }

    private function workedHours(?string $in, ?string $out): float
    {
        if (! $in || ! $out) {
            return 0;
        }
        $minutes = fn (string $t) => (int) substr($t, 0, 2) * 60 + (int) substr($t, 3, 2);
        $span = $minutes($out) - $minutes($in);

        return $span <= 0 ? 0 : max(0, round($span / 60 - self::BREAK_HOURS, 2));
    }
}
