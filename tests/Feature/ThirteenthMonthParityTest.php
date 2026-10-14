<?php

use App\Payroll\Num;
use App\Payroll\ThirteenthMonth;

/**
 * The golden fixture (tests/Fixtures/golden/thirteenth-month.json) keeps what the browser engine produced for 48 employee-years, not what it
 * read. So each line's inputs are rebuilt from its own numbers: the monthly basic from the earned total and the months, the undertime minutes
 * from the hours, one absent day per unpaid day. The PHP engine must then give every field of the line back.
 */
function goldenThirteenthEmployee(array $line, float $monthly, string $year): array
{
    $separated = $line['separated'] && $line['activeTo'] < "{$year}-12-31";

    return [
        'id' => $line['employeeId'],
        'employment' => ['dateHired' => $line['activeFrom'], 'dateSeparated' => $separated ? $line['activeTo'] : null, 'status' => $line['separated'] ? 'inactive' : 'active', 'department' => 'x'],
        'compensation' => ['payType' => 'monthly', 'basicPay' => $monthly, 'allowances' => []],
    ];
}

/** The monthly basic that earns this total over the window's months (the line has no pay rate), searched near total / months. */
function goldenMonthlyBasic(array $line, string $year): ?float
{
    $guess = (int) round($line['grossBasicEarned'] / max($line['monthsCredited'], 0.01));
    for ($d = 0; $d <= 400; $d++) {
        foreach ([$guess + $d, $guess - $d] as $monthly) {
            $employee = goldenThirteenthEmployee($line, $monthly, $year);
            $sum = array_sum(array_column(ThirteenthMonth::basicEarningsByMonth($employee, $line['activeFrom'], $line['activeTo']), 'amount'));
            if ($sum === (float) $line['grossBasicEarned']) {
                return (float) $monthly;
            }
        }
    }

    return null;
}

test('the PHP engine reproduces every golden 13th month line', function () {
    $golden = json_decode(file_get_contents(base_path('tests/Fixtures/golden/thirteenth-month.json')), true)['lines'];
    $problems = [];
    $full = 0;

    foreach ($golden as $row) {
        $line = $row['line'];
        $year = (string) $row['year'];
        $monthly = goldenMonthlyBasic($line, $year);
        if ($monthly === null) {
            $problems[] = "{$row['year']} {$row['employeeId']}: no monthly basic gives the earned total";

            continue;
        }
        $employee = goldenThirteenthEmployee($line, $monthly, $year);
        $coverage = ThirteenthMonth::coverageFor($row['year']);
        $dailyRate = $monthly / 22;

        // Undertime as minutes short of the scheduled end; absences as whole days. The golden hours and days carry the rounding.
        $minutes = (int) round($line['undertimeHours'] * 60);
        $attendance = $minutes > 0 ? [['date' => "{$year}-03-03", 'status' => 'undertime', 'timeOut' => '10:00', 'scheduleEndTime' => sprintf('%02d:%02d', intdiv(600 + $minutes, 60), (600 + $minutes) % 60)]] : [];
        for ($i = 0; $i < (int) $line['unpaidAbsenceDays']; $i++) {
            $attendance[] = ['date' => sprintf('%s-04-%02d', $year, $i + 1), 'status' => 'absent'];
        }

        // A half unpaid day: an absence of which a half-day paid leave covers the other half.
        $leaves = [];
        if ($line['unpaidAbsenceDays'] != (int) $line['unpaidAbsenceDays']) {
            $attendance[] = ['date' => "{$year}-05-05", 'status' => 'absent'];
            $leaves[] = ['dateFrom' => "{$year}-05-05", 'dateTo' => "{$year}-05-05", 'dayPortion' => 'half_am'];
        }

        $got = ThirteenthMonth::computeLine(['employee' => $employee, 'coverage' => $coverage, 'attendance' => $attendance, 'paidLeaves' => $leaves, 'annualMarginalRate' => 0.25]);
        foreach (['activeFrom', 'activeTo', 'separated', 'monthsCredited', 'grossBasicEarned', 'undertimeHours', 'undertimeDeduction', 'unpaidAbsenceDays', 'absenceDeduction', 'annualBasicEarned', 'thirteenthMonthPay', 'taxableExcess', 'withholdingTax', 'netPay'] as $key) {
            if ($got[$key] != $line[$key]) {
                $problems[] = "{$row['year']} {$row['employeeId']} {$key}: expected {$line[$key]}, got {$got[$key]}";
            }
        }
        $full += $line['monthsCredited'] == 12 ? 1 : 0;
        expect($dailyRate)->toBeGreaterThan(0);
    }

    expect(array_slice($problems, 0, 20))->toBe([]);
    expect($full)->toBeGreaterThan(30);
});

test('pay above the ceiling is withheld at the marginal annual rate on the excess only', function () {
    $employee = ['id' => '1', 'employment' => ['dateHired' => '2020-01-01', 'status' => 'active', 'department' => 'x'], 'compensation' => ['payType' => 'monthly', 'basicPay' => 100000, 'allowances' => []]];
    $line = ThirteenthMonth::computeLine(['employee' => $employee, 'coverage' => ThirteenthMonth::coverageFor(2026), 'annualMarginalRate' => 0.2]);

    // 1,200,000 / 12 = 100,000; 10,000 over the 90,000 ceiling at 20%.
    expect($line['thirteenthMonthPay'])->toEqual(100000)->and($line['taxableExcess'])->toEqual(10000)->and($line['withholdingTax'])->toEqual(2000)->and($line['netPay'])->toEqual(98000);
});

test('a paid leave covers an absence, a half day covers half, and a mid-year hire is pro-rated by days', function () {
    $employee = ['id' => '1', 'employment' => ['dateHired' => '2026-07-16', 'status' => 'active', 'department' => 'x'], 'compensation' => ['payType' => 'monthly', 'basicPay' => 31000, 'allowances' => []]];
    $attendance = [['date' => '2026-08-03', 'status' => 'absent'], ['date' => '2026-08-04', 'status' => 'absent'], ['date' => '2026-08-05', 'status' => 'absent']];
    $leaves = [['dateFrom' => '2026-08-03', 'dateTo' => '2026-08-03'], ['dateFrom' => '2026-08-04', 'dateTo' => '2026-08-04', 'dayPortion' => 'half_am']];

    $line = ThirteenthMonth::computeLine(['employee' => $employee, 'coverage' => ThirteenthMonth::coverageFor(2026), 'attendance' => $attendance, 'paidLeaves' => $leaves, 'annualMarginalRate' => 0]);

    // July 16-31 is 16 of 31 days: 16,000, then 5 full months of 31,000.
    expect($line['months'][0])->toMatchArray(['label' => 'July 2026', 'detail' => 'Jul 16 – 31 · 16 of 31 days', 'amount' => 16000.0])->and($line['monthsCredited'])->toEqual(5.52);
    // 1 day uncovered + 0.5 day left of the half-day leave = 1.5 days at 31,000 / 22.
    expect($line['unpaidAbsenceDays'])->toEqual(1.5)->and($line['absenceDeduction'])->toEqual(Num::round0(1.5 * 31000 / 22))->and($line['absenceDates'])->toBe(['2026-08-04', '2026-08-05']);
});

test('who a batch covers: active only, separated on their own, and a key that matches the same recipients', function () {
    $e = fn (string $id, string $status, ?string $separated = null, string $dept = 'Ops') => ['id' => $id, 'employment' => ['dateHired' => '2020-01-01', 'status' => $status, 'dateSeparated' => $separated, 'department' => $dept]];
    $all = [$e('1', 'active'), $e('2', 'active', null, 'HR'), $e('3', 'inactive', '2026-05-01'), $e('4', 'inactive')];
    $coverage = ThirteenthMonth::coverageFor(2026);

    $eligible = array_values(array_filter($all, fn ($x) => ThirteenthMonth::isEligible($x, $coverage)));
    expect(array_column($eligible, 'id'))->toBe(['1', '2', '3']);
    expect(array_column(ThirteenthMonth::applySelection($eligible, ['mode' => 'all']), 'id'))->toBe(['1', '2']);
    expect(array_column(ThirteenthMonth::applySelection($eligible, ['mode' => 'separated']), 'id'))->toBe(['3']);
    expect(array_column(ThirteenthMonth::applySelection($eligible, ['mode' => 'department', 'department' => 'HR']), 'id'))->toBe(['2']);
    expect(array_column(ThirteenthMonth::applySelection($eligible, ['mode' => 'payroll_group', 'payrollGroupId' => '9'], ['9' => ['1']]), 'id'))->toBe(['1']);
    expect(ThirteenthMonth::selectionKey(['mode' => 'employees', 'employeeIds' => ['2', '1']]))->toBe(ThirteenthMonth::selectionKey(['mode' => 'employees', 'employeeIds' => ['1', '2']]));
    // Separated before the year began: not eligible.
    expect(ThirteenthMonth::isEligible($e('5', 'inactive', '2025-12-31'), $coverage))->toBeFalse();
});
