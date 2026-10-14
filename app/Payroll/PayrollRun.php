<?php

namespace App\Payroll;

use App\Exceptions\ConflictException;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Models\Loan;
use App\Models\PayrollLine;
use App\Models\PayrollPeriod;
use App\Models\User;
use App\Models\WorkLog;
use App\Support\LoanLedger;
use Illuminate\Support\Facades\DB;

/**
 * The life of a payroll run: create (draft), run (review), hold and release employees, approve, finalize. Each step locks the period row and
 * checks its status, so two people cannot move a run at once and a finalized run answers 409 to everything.
 *
 * shortcut: runs are computed inside the request. Move `run` to a queued job when a company has more than about 300 employees.
 */
final class PayrollRun
{
    /** The payroll number the next run with this pay date gets: PR001 again at the start of each year. */
    public static function nextNumber(int $companyId, string $payDate): string
    {
        $max = PayrollPeriod::withoutGlobalScopes()->where('company_id', $companyId)->where('payroll_year', (int) substr($payDate, 0, 4))->pluck('payroll_number')
            ->map(fn ($n) => (int) preg_replace('/\D/', '', $n))->max() ?? 0;

        return 'PR'.str_pad((string) ($max + 1), 3, '0', STR_PAD_LEFT);
    }

    /** @param  array{label: string, start_date: string, end_date: string, pay_date: string, payroll_group_id?: int|null}  $data */
    public static function create(int $companyId, array $data): PayrollPeriod
    {
        return DB::transaction(function () use ($companyId, $data): PayrollPeriod {
            Company::whereKey($companyId)->lockForUpdate()->first(); // numbers are handed out one at a time

            return PayrollPeriod::create([
                ...$data, 'company_id' => $companyId, 'status' => 'draft', 'payroll_year' => (int) substr($data['pay_date'], 0, 4), 'payroll_number' => self::nextNumber($companyId, $data['pay_date']),
            ]);
        });
    }

    /** Computes every line of the run again and moves it to review. A re-run replaces the lines and frees, then locks again, the work logs. */
    public static function run(PayrollPeriod $period): PayrollPeriod
    {
        return self::editable($period, function (PayrollPeriod $period): void {
            $period->lines()->delete();
            WorkLog::withoutGlobalScopes()->where('payroll_period_id', $period->id)->update(['payroll_period_id' => null]);
            self::store($period, PayrollInputs::lines($period->company_id, $period->asEngineInput()));
            $period->update(['status' => 'review']);
        });
    }

    /** Takes employees out of an unapproved run: their lines go and the work logs they locked are freed. Returns how many were held. */
    public static function hold(PayrollPeriod $period, array $employeeIds): int
    {
        $held = 0;
        self::editable($period, function (PayrollPeriod $period) use ($employeeIds, &$held): void {
            $ids = Employee::withoutGlobalScopes()->where('company_id', $period->company_id)->whereIn('id', $employeeIds)->pluck('id')->diff($period->excluded_employee_ids ?? [])->values();
            $held = $ids->count();
            $period->update(['excluded_employee_ids' => [...($period->excluded_employee_ids ?? []), ...$ids->all()]]);
            $period->lines()->whereIn('employee_id', $ids)->delete();
            WorkLog::withoutGlobalScopes()->where('payroll_period_id', $period->id)->whereIn('employee_id', $ids)->update(['payroll_period_id' => null]);
        });

        return $held;
    }

    /** Puts held employees back; if the run was already calculated their lines are computed now. Returns how many were released. */
    public static function release(PayrollPeriod $period, array $employeeIds): int
    {
        $released = 0;
        self::editable($period, function (PayrollPeriod $period) use ($employeeIds, &$released): void {
            $ids = array_values(array_intersect($employeeIds, $period->excluded_employee_ids ?? []));
            $released = count($ids);
            $period->update(['excluded_employee_ids' => array_values(array_diff($period->excluded_employee_ids ?? [], $ids))]);
            if ($period->status === 'review' && $ids) {
                self::store($period, PayrollInputs::lines($period->company_id, $period->asEngineInput(), $ids));
            }
        });

        return $released;
    }

    public static function approve(PayrollPeriod $period, User $by): PayrollPeriod
    {
        return self::step($period, 'review', 'Only a run in review can be approved.', fn (PayrollPeriod $p) => $p->update(['status' => 'approved', 'approved_by' => $by->id, 'approved_at' => now()]));
    }

    /**
     * Locks the run. In the same transaction the loan installments it collected are posted to the loan ledgers and the one-time deductions
     * it took are settled, so no later run takes them again. The work logs were locked when it was calculated.
     */
    public static function finalize(PayrollPeriod $period, User $by): PayrollPeriod
    {
        return self::step($period, 'approved', 'Only an approved run can be finalized.', function (PayrollPeriod $p) use ($by): void {
            $payDate = $p->pay_date->toDateString();
            foreach ($p->lines()->get() as $line) {
                foreach ($line->breakdown['loanDeductions'] ?? [] as $d) {
                    $loan = Loan::withoutGlobalScopes()->where('employee_id', $line->employee_id)->where('label', $d['label'])->where('status', 'active')->orderBy('id')->first();
                    if ($loan) {
                        LoanLedger::repay($loan, (float) $d['amount'], $payDate, $p->label, $p->id);
                    }
                }
                foreach ($line->breakdown['otherDeductions'] ?? [] as $d) {
                    if (($d['kind'] ?? null) !== 'one_time') {
                        continue;
                    }
                    EmployeeDeduction::withoutGlobalScopes()->where('employee_id', $line->employee_id)->where('kind', 'one_time')->where('status', 'active')->where('name', $d['label'])
                        ->whereDate('due_date', '>=', $p->start_date)->whereDate('due_date', '<=', $p->end_date)->limit(1)->update(['status' => 'completed', 'settled_in_period_id' => $p->id]);
                }
            }
            $p->update(['status' => 'finalized', 'finalized_by' => $by->id, 'finalized_at' => now()]);
        });
    }

    /** Locks the row and runs `$apply` on a draft or review period; any other status is a conflict. */
    private static function editable(PayrollPeriod $period, \Closure $apply): PayrollPeriod
    {
        return DB::transaction(function () use ($period, $apply): PayrollPeriod {
            $current = PayrollPeriod::withoutGlobalScopes()->lockForUpdate()->findOrFail($period->id);
            if (! in_array($current->status, ['draft', 'review'], true)) {
                throw new ConflictException($current->status === 'finalized' ? 'This run is finalized and can no longer be changed.' : 'This run is approved and can no longer be changed.');
            }
            $apply($current);

            return $current->refresh();
        });
    }

    private static function step(PayrollPeriod $period, string $from, string $message, \Closure $apply): PayrollPeriod
    {
        return DB::transaction(function () use ($period, $from, $message, $apply): PayrollPeriod {
            $current = PayrollPeriod::withoutGlobalScopes()->lockForUpdate()->findOrFail($period->id);
            if ($current->status !== $from) {
                throw new ConflictException($message);
            }
            $apply($current);

            return $current->refresh();
        });
    }

    /** Saves the engine's lines and locks the approved work logs they paid to this run so no other run pays them again. */
    private static function store(PayrollPeriod $period, array $lines): void
    {
        foreach ($lines as $line) {
            PayrollLine::create([
                'company_id' => $period->company_id, 'payroll_period_id' => $period->id, 'employee_id' => (int) $line['employeeId'], 'gross_pay' => $line['grossPay'], 'total_deductions' => $line['totalDeductions'],
                'net_pay' => $line['netPay'], 'withholding_tax' => $line['withholdingTax'], 'sss_employee' => $line['sssEmployeeShare'], 'sss_employer' => $line['sssEmployerShare'],
                'philhealth_employee' => $line['philhealthEmployeeShare'], 'philhealth_employer' => $line['philhealthEmployerShare'], 'pagibig_employee' => $line['pagibigEmployeeShare'],
                'pagibig_employer' => $line['pagibigEmployerShare'], 'breakdown' => $line,
            ]);
        }
        WorkLog::withoutGlobalScopes()->where('company_id', $period->company_id)->whereIn('employee_id', array_column($lines, 'employeeId'))->where('status', 'approved')
            ->whereNull('payroll_period_id')->whereDate('work_date', '>=', $period->start_date)->whereDate('work_date', '<=', $period->end_date)->update(['payroll_period_id' => $period->id]);
    }
}
