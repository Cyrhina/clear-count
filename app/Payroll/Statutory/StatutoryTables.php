<?php

namespace App\Payroll\Statutory;

use App\Models\PagibigRate;
use App\Models\PhilhealthRate;
use App\Models\SssBracket;
use App\Models\TaxBracket;
use App\Payroll\Tax\WithholdingTax;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * The government tables in force for a company on a date. Each table (SSS, PhilHealth, Pag-IBIG, and each tax table of a pay period)
 * is resolved on its own: the company's latest row set starting on or before the date, or else the system default (company_id null).
 * Saving writes the company's row set for an effective date, replacing a set already saved for that same date.
 *
 * SEEDED RATES MUST BE CHECKED against the official SSS, PhilHealth, Pag-IBIG and BIR tables before release (docs/PLAN.md P8).
 */
final class StatutoryTables
{
    /** The date the system defaults take effect (the TRAIN tables; the SSS schedule of 2025 and the 2024-2025 PhilHealth and Pag-IBIG rules are what is seeded). */
    public const DEFAULTS_FROM = '2023-01-01';

    private const MONTHLY_TAX = [[0, 20833, 0, 0], [20833, 33333, 0.15, 0], [33333, 66667, 0.2, 1875], [66667, 166667, 0.25, 8541.8], [166667, 666667, 0.3, 33541.8], [666667, null, 0.35, 183541.8]];

    private const TAX_MINS = [
        'annual' => [[0, 250_000, 0, 0], [250_000, 400_000, 0.15, 0], [400_000, 800_000, 0.2, 22_500], [800_000, 2_000_000, 0.25, 102_500], [2_000_000, 8_000_000, 0.3, 402_500], [8_000_000, null, 0.35, 2_202_500]],
        'semi_monthly' => [[0, 10_417, 0, 0], [10_417, 16_667, 0.15, 0], [16_667, 33_333, 0.2, 937.5], [33_333, 83_333, 0.25, 4_270.7], [83_333, 333_333, 0.3, 16_770.7], [333_333, null, 0.35, 91_770.7]],
        'weekly' => [[0, 4_808, 0, 0], [4_808, 7_692, 0.15, 0], [7_692, 15_385, 0.2, 432.6], [15_385, 38_462, 0.25, 1_971.2], [38_462, 153_846, 0.3, 7_740.45], [153_846, null, 0.35, 42_355.65]],
        'daily' => [[0, 685, 0, 0], [685, 1_096, 0.15, 0], [1_096, 2_192, 0.2, 61.65], [2_192, 5_479, 0.25, 280.85], [5_479, 21_918, 0.3, 1_102.6], [21_918, null, 0.35, 6_034.3]],
    ];

    /** Creates the system defaults the first time they are needed. */
    public static function ensureDefaults(): void
    {
        if (SssBracket::whereNull('company_id')->exists()) {
            return;
        }

        // SSS from January 2025 (Circular 2024-006): 15% of the monthly salary credit (5% employee, 10% employer), MSC 5,000 to 35,000 in steps of 500, plus EC.
        for ($msc = 5000; $msc <= 35000; $msc += 500) {
            SssBracket::create([
                'company_id' => null, 'effective_from' => self::DEFAULTS_FROM, 'min_salary' => $msc === 5000 ? 0 : $msc - 250, 'max_salary' => $msc === 35000 ? null : $msc + 250,
                'msc' => $msc, 'employee_share' => $msc * 0.05, 'employer_share' => $msc * 0.1, 'ec' => $msc < 15000 ? 10 : 30,
            ]);
        }
        // PhilHealth 2024-2025: 5% of basic salary, floor 10,000, ceiling 100,000, split evenly.
        PhilhealthRate::create(['company_id' => null, 'effective_from' => self::DEFAULTS_FROM, 'rate' => 0.05, 'employee_share_percent' => 0.5, 'employer_share_percent' => 0.5, 'salary_floor' => 10000, 'salary_ceiling' => 100000]);
        // Pag-IBIG (HDMF Circular 460): 2% each on pay up to 10,000 (200 cap); 1% for employees earning 1,500 or less.
        PagibigRate::create(['company_id' => null, 'effective_from' => self::DEFAULTS_FROM, 'rate' => 0.02, 'max_fund_salary' => 10000, 'employee_amount' => 200, 'employer_amount' => 200]);

        foreach (['monthly' => self::MONTHLY_TAX, ...self::TAX_MINS] as $frequency => $rows) {
            self::writeTax(null, self::DEFAULTS_FROM, $frequency, array_map(fn ($r) => ['min' => $r[0], 'max' => $r[1], 'rate' => $r[2], 'base_tax' => $r[3]], $rows));
        }
    }

    /**
     * @return array{sss_brackets: list<array<string, mixed>>, philhealth: array<string, float>, pagibig: array<string, float>, tax_tables: array<string, list<array<string, mixed>>>, effective_from: array<string, string>}
     */
    public static function for(int $companyId, string $date): array
    {
        self::ensureDefaults();

        $sss = self::inForce(SssBracket::class, $companyId, $date);
        $ph = self::inForce(PhilhealthRate::class, $companyId, $date)->first();
        $pi = self::inForce(PagibigRate::class, $companyId, $date)->first();
        $tax = [];
        $from = ['sss' => $sss->first()?->effective_from?->toDateString(), 'philhealth' => $ph?->effective_from->toDateString(), 'pagibig' => $pi?->effective_from->toDateString()];
        foreach (WithholdingTax::FREQUENCIES as $frequency) {
            $rows = self::inForce(TaxBracket::class, $companyId, $date, fn ($q) => $q->where('frequency', $frequency));
            $tax[$frequency] = $rows->map(fn (TaxBracket $b) => ['min' => $b->min, 'max' => $b->max, 'rate' => $b->rate, 'base_tax' => $b->base_tax])->all();
            $from["tax_{$frequency}"] = $rows->first()?->effective_from->toDateString();
        }

        return [
            'sss_brackets' => $sss->map(fn (SssBracket $b) => ['min_salary' => $b->min_salary, 'max_salary' => $b->max_salary, 'msc' => $b->msc, 'employee_share' => $b->employee_share, 'employer_share' => $b->employer_share, 'ec' => $b->ec])->all(),
            'philhealth' => $ph->only(['rate', 'employee_share_percent', 'employer_share_percent', 'salary_floor', 'salary_ceiling']),
            'pagibig' => $pi->only(['rate', 'max_fund_salary', 'employee_amount', 'employer_amount']),
            'tax_tables' => $tax,
            'effective_from' => $from,
        ];
    }

    /** @param  list<array<string, mixed>>  $rows */
    public static function saveSss(int $companyId, string $date, array $rows): void
    {
        DB::transaction(function () use ($companyId, $date, $rows): void {
            SssBracket::where('company_id', $companyId)->whereDate('effective_from', $date)->delete();
            foreach ($rows as $r) {
                SssBracket::create([...$r, 'company_id' => $companyId, 'effective_from' => $date]);
            }
        });
    }

    /** @param  array<string, mixed>  $values */
    public static function saveRule(string $model, int $companyId, string $date, array $values): void
    {
        DB::transaction(function () use ($model, $companyId, $date, $values): void {
            $model::where('company_id', $companyId)->whereDate('effective_from', $date)->delete();
            $model::create([...$values, 'company_id' => $companyId, 'effective_from' => $date]);
        });
    }

    /** @param  list<array<string, mixed>>  $rows */
    public static function saveTax(int $companyId, string $date, string $frequency, array $rows): void
    {
        DB::transaction(fn () => self::writeTax($companyId, $date, $frequency, $rows));
    }

    /** @param  list<array<string, mixed>>  $rows */
    private static function writeTax(?int $companyId, string $date, string $frequency, array $rows): void
    {
        TaxBracket::where('company_id', $companyId)->where('frequency', $frequency)->whereDate('effective_from', $date)->delete();
        foreach ($rows as $r) {
            TaxBracket::create([...$r, 'company_id' => $companyId, 'effective_from' => $date, 'frequency' => $frequency]);
        }
    }

    /**
     * The row set in force: the company's latest effective_from on or before the date, else the system's.
     *
     * @param  class-string<Model>  $model
     * @return Collection<int, Model>
     */
    private static function inForce(string $model, int $companyId, string $date, ?\Closure $scope = null)
    {
        foreach ([$companyId, null] as $owner) {
            $query = $model::where('company_id', $owner)->whereDate('effective_from', '<=', $date);
            if ($scope) {
                $scope($query);
            }
            $latest = (clone $query)->max('effective_from');
            if ($latest) {
                return $query->whereDate('effective_from', $latest)->orderBy('id')->get();
            }
        }

        return $model::query()->whereRaw('0 = 1')->get();
    }
}
