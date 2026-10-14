<?php

namespace App\Payroll;

use App\Payroll\Statutory\StatutoryCalculator;
use App\Payroll\Tax\WithholdingTax;

/**
 * One employee's payroll line for one period: basic pay, absences, paid leave, overtime, bonuses, benefits, final-pay proration, loans,
 * statutory shares, withholding tax and the deduction waterfall. Port of `computeLine` (payrollService.ts); the golden fixture
 * tests/Fixtures/golden/payroll-runs.json is its parity test.
 *
 * Pure: it reads only `$c` and returns a line in the shape of `PayrollLine` (types/domain.ts, camelCase). `PayrollInputs` builds `$c` from the database.
 * `$c` holds: period, employee, config (StatutoryTables::for), groups, schedules, attendanceRecords, leaveRequests, leaveTypes, overtimeRecords,
 * workLogs, bonuses, benefits, deductions, loans, deductionConfigs. Ids are strings.
 *
 * Not ported on purpose: the late policy (configured but never applied by the browser engine; the owner said not yet).
 */
final class ComputeLine
{
    public const PAID_LEAVE_EARNING_LABEL = 'Paid Leave';

    private const OVERTIME_LABEL = ['regular' => 'Overtime Pay', 'night_diff' => 'Night Differential', 'rest_day_holiday' => 'Rest Day / Holiday Overtime'];

    /** @param  array<string, mixed>  $c */
    public static function run(array $c): array
    {
        $period = $c['period'];
        $employee = $c['employee'];
        $config = $c['config'];
        $id = (string) $employee['id'];
        $groups = $c['groups'];

        $group = ! empty($period['payrollGroupId']) ? self::first($groups, fn ($g) => (string) $g['id'] === (string) $period['payrollGroupId']) : null;
        $employeeGroup = self::first($groups, fn ($g) => in_array($id, array_map('strval', $g['employeeIds'] ?? []), true));
        $workScheduleId = ($group ?? $employeeGroup)['workScheduleId'] ?? null;
        $workSchedule = self::first($c['schedules'], fn ($s) => $workScheduleId !== null && (string) $s['id'] === (string) $workScheduleId) ?? ($c['schedules'][0] ?? null);
        $schedule = PayFrequency::payScheduleFor($period, $group, $workSchedule, $employeeGroup);
        // A run covering several of the employee's cutoffs pays that many periods' worth of salary and allowances.
        $payPeriodsPerMonth = $schedule['periodsPerMonth'] / max(1, count($schedule['cutoffsCovered']));
        $configNamed = fn (string $name) => self::first($c['deductionConfigs'], fn ($d) => $d['name'] === $name);

        [$unpaidAbsentDays, $paidLeaveDays] = self::attendanceOutcome($c, $id, $period);

        $basicPayResult = RateBasis::basicPay($employee, $period, $c['attendanceRecords'], $c['workLogs'], $payPeriodsPerMonth);
        $payType = $employee['compensation']['payType'];
        $isSalaried = $payType === 'monthly' || $payType === 'semi_monthly';
        $dailyRate = RateBasis::dailyRate($employee);
        $hourlyRate = RateBasis::hourlyRate($employee);
        // Daily and hourly rates pay only recorded days, so they get no separate absence deduction.
        $absenceDeduction = $isSalaried ? Num::round0($dailyRate * $unpaidAbsentDays) : 0.0;
        $paidLeaveEarning = ! $isSalaried && in_array($payType, ['daily', 'hourly'], true) && $paidLeaveDays > 0
            ? [['label' => self::PAID_LEAVE_EARNING_LABEL, 'amount' => Num::round2($dailyRate * $paidLeaveDays)]]
            : [];

        // Approved overtime and night differential in the period: hours x hourly rate x the multiplier filed with the request.
        $overtimeByType = [];
        foreach ($c['overtimeRecords'] as $r) {
            if ((string) $r['employeeId'] !== $id || $r['status'] !== 'approved' || $r['date'] < $period['startDate'] || $r['date'] > $period['endDate']) {
                continue;
            }
            $overtimeByType[$r['type']] = ($overtimeByType[$r['type']] ?? 0) + $r['hours'] * $hourlyRate * $r['multiplier'];
        }
        $overtimeEarnings = [];
        foreach ($overtimeByType as $type => $amount) {
            $overtimeEarnings[] = ['label' => self::OVERTIME_LABEL[$type] ?? 'Overtime Pay', 'amount' => Num::round2($amount)];
        }
        $overtimePay = array_sum(array_column($overtimeEarnings, 'amount'));

        // Approved bonuses tagged for this period flow into gross pay; "separate payslip" bonuses are paid on their own.
        $approvedBonuses = array_values(array_filter($c['bonuses'], fn ($b) => $b['status'] === 'approved' && BonusMatching::includedInRegularPayroll($b)
            && BonusMatching::labelMatches($b['periodLabel'], $period) && BonusMatching::appliesTo($b, $employee)));
        $bonusEarnings = array_map(fn ($b) => ['label' => $b['name'], 'amount' => BonusMatching::amountFor($b, $employee)], $approvedBonuses);

        // Benefits active in the period. Cash allowances are earnings; the rest are employer-paid and shown on the payslip.
        $activeBenefits = array_values(array_filter($c['benefits'], fn ($b) => (string) $b['employeeId'] === $id && $b['status'] === 'active'
            && $b['startDate'] <= $period['endDate'] && (empty($b['endDate']) || $b['endDate'] >= $period['startDate'])));
        $benefitAllowances = array_values(array_filter($activeBenefits, fn ($b) => $b['category'] === 'allowance'));
        $benefitsProvided = array_map(fn ($b) => array_filter(
            ['label' => $b['name'], 'category' => $b['category'], 'provider' => $b['provider'] ?? null, 'amount' => Num::round2($b['monthlyValue'] / $payPeriodsPerMonth)],
            fn ($v) => $v !== null,
        ), array_values(array_filter($activeBenefits, fn ($b) => $b['category'] !== 'allowance')));

        // Final pay: an employee who separates mid-run is paid only through the last working day. Salaried pay and fixed allowances are
        // prorated by calendar days; daily, hourly and output pay already follow recorded work.
        $lastDay = $employee['employment']['dateSeparated'] ?? null;
        $isFinalRun = ! empty($lastDay) && $lastDay >= $period['startDate'] && $lastDay < $period['endDate'];
        $workedFraction = $isFinalRun ? self::daysBetween($period['startDate'], $lastDay) / self::daysBetween($period['startDate'], $period['endDate']) : 1;
        $prorate = fn (float $amount) => Num::round2($amount * $workedFraction);
        $basicPayAmount = $isSalaried ? $prorate($basicPayResult['amount']) : $basicPayResult['amount'];
        $basicPayLabel = $isFinalRun ? "{$basicPayResult['label']} (final pay, prorated to {$lastDay})" : $basicPayResult['label'];

        $earnings = [
            ['label' => $basicPayLabel, 'amount' => $basicPayAmount],
            ...$paidLeaveEarning,
            ...$overtimeEarnings,
            ...array_map(fn ($a) => ['label' => $a['label'], 'amount' => $prorate(Num::round2($a['amount'] / $payPeriodsPerMonth))], $employee['compensation']['allowances'] ?? []),
            ...array_map(fn ($b) => ['label' => $b['name'], 'amount' => $prorate(Num::round2($b['monthlyValue'] / $payPeriodsPerMonth))], $benefitAllowances),
            ...$bonusEarnings,
        ];
        $grossPay = Num::round2(array_sum(array_column($earnings, 'amount')));

        // Loans: the monthly amortization allocated per the loan type's schedule, never above the balance.
        $loanDeductions = [];
        foreach ($c['loans'] as $loan) {
            if ((string) $loan['employeeId'] !== $id || $loan['status'] !== 'active' || ! ($loan['balance'] > 0) || $loan['startDate'] > $period['endDate']) {
                continue;
            }
            $amount = min(PayFrequency::allocateMonthly($loan['monthlyDeduction'], $schedule, $configNamed(PayFrequency::loanConfigNameFor($loan['type']))), $loan['balance']);
            if ($amount > 0) {
                $loanDeductions[] = ['label' => $loan['label'], 'amount' => $amount];
            }
        }

        // Statutory: full monthly amounts, each allocated to this cutoff per its Payroll Settings schedule, and prorated in a final-pay run.
        $monthly = StatutoryCalculator::monthlyFor($config, RateBasis::monthlyEquivalent($employee), $schedule['frequency'], $schedule['periodsPerMonth'], (float) ($employee['government']['pagibigEmployeeContribution'] ?? 0));
        $alloc = fn (float $amount, string $name) => $prorate(PayFrequency::allocateMonthly($amount, $schedule, $configNamed($name)));
        $sssEmployeeShare = $alloc($monthly['sss_employee'], 'SSS Contribution');
        $sssEmployerShare = $alloc($monthly['sss_employer'], 'SSS Contribution');
        $philhealthEmployeeShare = $alloc($monthly['philhealth_employee'], 'PhilHealth Contribution');
        $philhealthEmployerShare = $alloc($monthly['philhealth_employer'], 'PhilHealth Contribution');
        $pagibigEmployeeShare = $alloc($monthly['pagibig_employee'], 'Pag-IBIG Contribution');
        $pagibigEmployerShare = $alloc($monthly['pagibig_employer'], 'Pag-IBIG Contribution');

        // Withholding tax: the pay period's taxable pay (basic less absences and the contributions taken) looked up in the table for the pay
        // frequency, plus taxable extras (overtime, taxable bonuses) at the marginal rate. A company that emptied the table falls back to the
        // monthly tax split by the allocation settings.
        $taxFrequency = WithholdingTax::frequencyFor($schedule['frequency'], $schedule['periodsPerMonth']);
        $taxTable = ($config['tax_tables'][$taxFrequency] ?? null) ?: null;
        $cutoffsInRun = max(1, count($schedule['cutoffsCovered']));
        $marginalRate = $monthly['marginal_rate'];
        $withholdingTaxBasis = null;
        if ($taxTable) {
            $contributions = $sssEmployeeShare + $philhealthEmployeeShare + $pagibigEmployeeShare;
            $regularPay = $basicPayAmount + array_sum(array_column($paidLeaveEarning, 'amount')) - $absenceDeduction;
            $taxable = max(0, Num::round2(($regularPay - $contributions) / $cutoffsInRun));
            $baseWithholdingTax = Num::round0(WithholdingTax::on($taxable, $taxTable) * $cutoffsInRun);
            $marginalRate = WithholdingTax::marginalRate($taxable, $taxTable);
            $withholdingTaxBasis = ['frequency' => $taxFrequency, 'taxable' => $taxable, 'regularTax' => $baseWithholdingTax, 'marginalRate' => $marginalRate, 'cutoffs' => $cutoffsInRun];
        } else {
            $baseWithholdingTax = Num::round0($alloc($monthly['withholding_tax'], 'Withholding Tax'));
        }
        $taxableBonusAmount = array_sum(array_map(fn ($b) => BonusMatching::amountFor($b, $employee), array_filter($approvedBonuses, fn ($b) => $b['taxable'])));
        $withholdingTax = $baseWithholdingTax + Num::round0(($taxableBonusAmount + $overtimePay) * $marginalRate);

        $absenceLines = $absenceDeduction > 0 ? [['label' => 'Absences', 'amount' => $absenceDeduction]] : [];

        // Deductions from Benefits, Loans & Deductions: benefit employee shares and recurring deductions are monthly amounts split like the
        // other recurring deductions; a one-time deduction is taken in full in the run whose period holds its due date.
        $periodActive = fn ($d) => ! empty($d['startDate']) && $d['startDate'] <= $period['endDate'] && (empty($d['endDate']) || $d['endDate'] >= $period['startDate']);
        $employeeDeductions = array_values(array_filter($c['deductions'], fn ($d) => (string) $d['employeeId'] === $id));
        $extraDeductions = [
            ...array_map(fn ($b) => ['label' => "{$b['name']} – Employee Share", 'amount' => PayFrequency::allocateMonthly($b['employeeShare'], $schedule, $configNamed($b['name'])), 'kind' => 'benefit'],
                array_filter($activeBenefits, fn ($b) => $b['employeeShare'] > 0)),
            ...array_map(fn ($d) => ['label' => $d['name'], 'amount' => PayFrequency::allocateMonthly($d['amount'], $schedule, $configNamed($d['name'])), 'kind' => 'recurring'],
                array_filter($employeeDeductions, fn ($d) => $d['kind'] === 'recurring' && $d['status'] === 'active' && $periodActive($d))),
            ...array_map(fn ($d) => ['label' => $d['name'], 'amount' => (float) $d['amount'], 'kind' => 'one_time'],
                array_filter($employeeDeductions, fn ($d) => $d['kind'] === 'one_time' && ! empty($d['dueDate']) && $d['dueDate'] >= $period['startDate'] && $d['dueDate'] <= $period['endDate']
                    && ($d['status'] === 'active' || ($d['status'] === 'completed' && (string) ($d['appliedPeriodId'] ?? '') === (string) $period['id'])))),
        ];
        $extraDeductions = array_values(array_filter($extraDeductions, fn ($d) => $d['amount'] > 0));

        // Statutory contributions, tax and absences are always taken; the rest only up to what the remaining pay covers, so a thin cutoff never
        // goes negative. What is not collected stays on the loan balance for later cutoffs.
        $remaining = $grossPay - ($sssEmployeeShare + $philhealthEmployeeShare + $pagibigEmployeeShare + $withholdingTax + $absenceDeduction);
        $collectedExtras = [];
        foreach ($extraDeductions as $d) {
            $amount = Num::round2(max(0, min($d['amount'], $remaining)));
            $remaining -= $amount;
            if ($amount > 0) {
                $collectedExtras[] = [...$d, 'amount' => $amount];
            }
        }
        $otherDeductions = [...$absenceLines, ...$collectedExtras];

        $collectedLoans = [];
        foreach ($loanDeductions as $d) {
            $amount = Num::round2(max(0, min($d['amount'], $remaining)));
            $remaining -= $amount;
            if ($amount > 0) {
                $collectedLoans[] = [...$d, 'amount' => $amount];
            }
        }

        $totalDeductions = Num::round2(array_sum(array_column($collectedLoans, 'amount')) + array_sum(array_column($otherDeductions, 'amount'))
            + $sssEmployeeShare + $philhealthEmployeeShare + $pagibigEmployeeShare + $withholdingTax);

        return array_filter([
            'id' => "{$period['id']}_{$id}", 'periodId' => (string) $period['id'], 'employeeId' => $id,
            'basicPay' => (float) $employee['compensation']['basicPay'], 'earnings' => $earnings, 'grossPay' => $grossPay, 'absentDays' => $unpaidAbsentDays,
            'loanDeductions' => $collectedLoans, 'otherDeductions' => $otherDeductions,
            'sssEmployeeShare' => $sssEmployeeShare, 'sssEmployerShare' => $sssEmployerShare, 'philhealthEmployeeShare' => $philhealthEmployeeShare,
            'philhealthEmployerShare' => $philhealthEmployerShare, 'pagibigEmployeeShare' => $pagibigEmployeeShare, 'pagibigEmployerShare' => $pagibigEmployerShare,
            'withholdingTax' => $withholdingTax, 'totalDeductions' => $totalDeductions, 'netPay' => Num::round0($grossPay - $totalDeductions),
            'payFrequency' => $schedule['frequency'], 'periodsPerMonth' => $payPeriodsPerMonth, 'periodsInMonth' => $schedule['periodsPerCycle'],
            'cutoffIndex' => $schedule['cutoffIndex'], 'cutoffsCovered' => $schedule['cutoffsCovered'],
            'monthlyStatutory' => [
                'sssEmployee' => $monthly['sss_employee'], 'sssEmployer' => $monthly['sss_employer'], 'philhealthEmployee' => $monthly['philhealth_employee'], 'philhealthEmployer' => $monthly['philhealth_employer'],
                'pagibigEmployee' => $monthly['pagibig_employee'], 'pagibigEmployer' => $monthly['pagibig_employer'], 'withholdingTax' => $monthly['withholding_tax'],
            ],
            'withholdingTaxBasis' => $withholdingTaxBasis, 'overtimePay' => Num::round2($overtimePay), 'benefitsProvided' => $benefitsProvided,
            'benefitAllowances' => array_map(fn ($b) => $b['name'], $benefitAllowances),
        ], fn ($v) => $v !== null);
    }

    /**
     * Absent days in the period, split into unpaid absences (deducted) and paid-leave days (paid): a day covered by approved paid leave is
     * paid, never deducted; a half-day leave covers half.
     *
     * @return array{0: float, 1: float}
     */
    private static function attendanceOutcome(array $c, string $employeeId, array $period): array
    {
        $absences = array_filter($c['attendanceRecords'], fn ($r) => (string) $r['employeeId'] === $employeeId && $r['status'] === 'absent' && $r['date'] >= $period['startDate'] && $r['date'] <= $period['endDate']);
        $paidLeave = 0.0;
        foreach ($absences as $a) {
            $covered = 0.0;
            foreach ($c['leaveRequests'] as $r) {
                if ((string) $r['employeeId'] !== $employeeId || $r['status'] !== 'approved' || $r['dateFrom'] > $a['date'] || $r['dateTo'] < $a['date']) {
                    continue;
                }
                $type = self::first($c['leaveTypes'], fn ($t) => (string) $t['id'] === (string) $r['leaveTypeId']);
                if ($type && ($type['isPaid'] ?? true) !== false) {
                    $covered += in_array($r['dayPortion'] ?? 'full', ['half_am', 'half_pm'], true) ? 0.5 : 1;
                }
            }
            $paidLeave += min(1, $covered);
        }

        return [count($absences) - $paidLeave, $paidLeave];
    }

    private static function daysBetween(string $from, string $to): int
    {
        return (int) round((strtotime($to.' UTC') - strtotime($from.' UTC')) / 86400) + 1;
    }

    /** @param  callable(array): bool  $test */
    private static function first(array $rows, callable $test): ?array
    {
        foreach ($rows as $row) {
            if ($test($row)) {
                return $row;
            }
        }

        return null;
    }
}
