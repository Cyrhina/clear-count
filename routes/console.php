<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Fills in the day's attendance of approved WFH arrangements (also catches up days missed while the app was down).
Schedule::command('attendance:materialize-wfh')->dailyAt('00:30');
