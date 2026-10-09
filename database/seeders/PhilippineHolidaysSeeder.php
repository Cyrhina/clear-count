<?php

namespace Database\Seeders;

use App\Support\PhilippineHolidays;
use Illuminate\Database\Seeder;

/** Fills the shared system calendar (rows with no company) for last year, this year and next. Safe to run again. */
class PhilippineHolidaysSeeder extends Seeder
{
    public function run(): void
    {
        foreach (range(now()->year - 1, now()->year + 1) as $year) {
            PhilippineHolidays::ensureSystemDefaults($year);
        }
    }
}
