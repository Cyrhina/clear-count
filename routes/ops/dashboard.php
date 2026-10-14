<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/dashboard')->name('api.dashboard.')->middleware('permission:dashboard.view')->group(function () {
    Route::get('overview', [DashboardController::class, 'overview'])->name('overview');
    Route::get('payroll', [DashboardController::class, 'payroll'])->name('payroll');
    Route::get('workforce', [DashboardController::class, 'workforce'])->name('workforce');
});

Route::get('api/reports/payroll-lines', [ReportController::class, 'payrollLines'])->middleware('permission:reports.payroll.view|reports.workforce.view')->name('api.reports.payroll-lines');
