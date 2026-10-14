<?php

use App\Http\Controllers\PayslipController;
use App\Http\Controllers\PayslipEmailController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/payslips')->name('api.payslips.')->group(function () {
    Route::get('/', [PayslipController::class, 'index'])->middleware('permission:ess.view')->name('index');
    Route::middleware('permission:payslips.view|payroll.view|ess.view')->group(function () {
        Route::get('{line}', [PayslipController::class, 'show'])->name('show');
        Route::get('{line}/pdf', [PayslipController::class, 'pdf'])->name('pdf');
    });
});

Route::prefix('api/payslip-emails')->name('api.payslip-emails.')->group(function () {
    Route::get('/', [PayslipEmailController::class, 'index'])->middleware('permission:payslips.view|payroll.view|thirteenth_month.view|bonuses.view')->name('index');
    Route::post('/', [PayslipEmailController::class, 'send'])->middleware('permission:payslips.generate|thirteenth_month.manage|bonuses.manage')->name('send');
});
