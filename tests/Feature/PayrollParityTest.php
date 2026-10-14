<?php

use App\Payroll\ComputeLine;
use App\Payroll\RateBasis;

/**
 * The golden fixture the browser engine produced (tests/Fixtures/golden/payroll-runs.json): every period's lines and the data they were computed
 * from. The PHP engine replays the periods oldest first, as the sample run seeder did, finalizing the finalized ones so loans and one-time
 * deductions carry from run to run, and must produce the same lines.
 *
 * Accepted difference: an output-based employee with no work logs in the period. The browser engine paid an invented quantity for them
 * (`mockOutputQuantity`); the PHP engine pays only approved work logs, so those lines are skipped and counted below.
 */

/** @return list<string> every place the two values differ */
function payrollDiff(mixed $expected, mixed $actual, string $path): array
{
    if (is_array($expected)) {
        if (! is_array($actual)) {
            return ["{$path}: expected an array"];
        }
        $diffs = [];
        foreach ($expected as $key => $value) {
            $diffs = [...$diffs, ...(array_key_exists($key, $actual) ? payrollDiff($value, $actual[$key], "{$path}.{$key}") : ["{$path}.{$key}: missing"])];
        }
        if (array_is_list($expected) && count($expected) !== count($actual)) {
            $diffs[] = "{$path}: expected ".count($expected).' items, got '.count($actual);
        }

        return $diffs;
    }
    if (is_numeric($expected) && is_numeric($actual)) {
        return abs($expected - $actual) < 0.0001 ? [] : ["{$path}: expected {$expected}, got {$actual}"];
    }

    return $expected === $actual ? [] : ["{$path}: expected ".json_encode($expected).', got '.json_encode($actual)];
}

test('the PHP engine reproduces every golden payroll line', function () {
    $golden = json_decode(file_get_contents(base_path('tests/Fixtures/golden/payroll-runs.json')), true);
    $in = $golden['inputs'];
    $config = statutoryGolden()['php_config'];

    // Loans as they were before the sample runs: the runs' repayments are taken back off.
    $earliest = min(array_column($golden['periods'], 'startDate'));
    $loans = array_map(function ($l) use ($earliest) {
        $undone = array_sum(array_column(array_filter($l['repaymentHistory'] ?? [], fn ($h) => $h['date'] >= $earliest), 'amount'));
        $balance = min($l['principal'], round($l['balance'] + $undone, 2));

        return [...$l, 'balance' => $balance, 'status' => in_array($l['status'], ['suspended', 'cancelled'], true) ? $l['status'] : ($balance > 0 ? 'active' : 'completed')];
    }, $golden['loansAfterRuns']);

    // Periods in the order the seeder ran them: oldest first, ties in creation order (the fixture lists newest first).
    $periods = array_reverse($golden['periods']);
    usort($periods, fn ($a, $b) => strcmp($a['startDate'], $b['startDate']));

    $linesByPeriod = [];
    foreach ($golden['lines'] as $line) {
        $linesByPeriod[$line['periodId']][$line['employeeId']] = $line;
    }

    $workLogs = $in['compensationApprovals'];
    $deductions = $in['employeeDeductions'];
    $compared = 0;
    $skipped = 0;
    $problems = [];

    foreach ($periods as $period) {
        $runDate = $period;
        $group = collect($in['payrollGroups'])->firstWhere('id', $period['payrollGroupId'] ?? null);
        $employees = array_filter($in['employees'], fn ($e) => ($e['employment']['status'] === 'active'
            || (! empty($e['employment']['dateSeparated']) && $e['employment']['dateSeparated'] >= $period['startDate'] && $e['employment']['dateSeparated'] <= $period['endDate']))
            && (! $group || in_array($e['id'], $group['employeeIds'], true)) && ! in_array($e['id'], $period['excludedEmployeeIds'] ?? [], true));

        $ctxBase = [
            'period' => $runDate, 'config' => $config, 'groups' => $in['payrollGroups'], 'schedules' => $in['schedules'], 'attendanceRecords' => $in['attendanceRecords'],
            'leaveRequests' => $in['leaveRequests'], 'leaveTypes' => $in['leaveTypes'], 'overtimeRecords' => $in['overtimeRecords'], 'bonuses' => $in['bonuses'],
            'benefits' => $in['employeeBenefits'], 'deductionConfigs' => $in['deductionConfigs'],
        ];

        $expectedForPeriod = $linesByPeriod[$period['id']] ?? [];
        foreach ($employees as $employee) {
            $line = ComputeLine::run([...$ctxBase, 'employee' => $employee, 'workLogs' => $workLogs, 'deductions' => $deductions, 'loans' => $loans]);
            $expected = $expectedForPeriod[$employee['id']] ?? null;
            if (! $expected) {
                $problems[] = "{$period['id']} {$employee['id']}: the browser engine made no line";

                continue;
            }
            $noLogs = $employee['compensation']['payType'] === 'output_based' && ! array_filter($workLogs, fn ($a) => $a['employeeId'] === $employee['id'] && $a['workDate'] >= $period['startDate'] && $a['workDate'] <= $period['endDate']);
            if ($noLogs) {
                $skipped++;
            } else {
                $compared++;
                $problems = [...$problems, ...payrollDiff(array_diff_key($expected, ['id' => 1, 'companyId' => 1]), $line, "{$period['id']} {$employee['id']}")];
            }
            unset($expectedForPeriod[$employee['id']]);
            // Carry the browser engine's own line forward so one skipped line cannot throw later periods off.
            $linesByPeriod[$period['id']][$employee['id']] = $expected;
        }
        foreach ($expectedForPeriod as $employeeId => $left) {
            $problems[] = "{$period['id']} {$employeeId}: the PHP engine made no line";
        }

        // The run locks the work logs it paid, so no other run pays them again.
        foreach ($employees as $employee) {
            $payable = array_column(RateBasis::workLogsForPeriod($employee['id'], $period, $workLogs)['payable'], 'id');
            foreach ($workLogs as $i => $a) {
                if (in_array($a['id'], $payable, true)) {
                    $workLogs[$i]['payrollPeriodId'] = $period['id'];
                }
            }
        }

        // A finalized run takes the loan installments and settles the one-time deductions it collected.
        if ($period['status'] === 'finalized') {
            foreach ($linesByPeriod[$period['id']] as $expected) {
                foreach ($expected['loanDeductions'] as $d) {
                    foreach ($loans as $i => $l) {
                        if ($l['employeeId'] === $expected['employeeId'] && $l['label'] === $d['label']) {
                            $loans[$i]['balance'] = max(0, $l['balance'] - $d['amount']);
                            if ($loans[$i]['balance'] === 0) {
                                $loans[$i]['status'] = 'completed';
                            }
                            break;
                        }
                    }
                }
                foreach ($expected['otherDeductions'] as $d) {
                    if (($d['kind'] ?? null) !== 'one_time') {
                        continue;
                    }
                    foreach ($deductions as $i => $r) {
                        if ($r['employeeId'] === $expected['employeeId'] && $r['kind'] === 'one_time' && $r['status'] === 'active' && $r['name'] === $d['label'] && ! empty($r['dueDate']) && $r['dueDate'] >= $period['startDate'] && $r['dueDate'] <= $period['endDate']) {
                            $deductions[$i]['status'] = 'completed';
                            $deductions[$i]['appliedPeriodId'] = $period['id'];
                            break;
                        }
                    }
                }
            }
        }
    }

    expect(array_slice($problems, 0, 25))->toBe([]);
    expect($compared)->toBeGreaterThan(100);
    fwrite(STDERR, "payroll parity: {$compared} lines compared, {$skipped} output-based lines without work logs skipped\n");
});
