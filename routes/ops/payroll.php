<?php

use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PayrollInputsController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/payroll')->name('api.payroll.')->group(function () {
    Route::middleware('permission:payroll.view|payslips.view')->group(function () {
        Route::get('/', [PayrollController::class, 'index'])->name('index');
        Route::get('employees', [PayrollController::class, 'employees'])->name('employees');
        Route::get('next-number', [PayrollController::class, 'nextNumber'])->name('next-number');
        Route::get('lines/{line}', [PayrollController::class, 'line'])->name('lines.show');
        Route::get('{period}/lines', [PayrollController::class, 'lines'])->name('lines.index');
    });
    Route::get('{period}/records', [PayrollInputsController::class, 'records'])->middleware('permission:payroll.view')->name('records');
    Route::middleware('permission:payroll.run')->group(function () {
        Route::post('/', [PayrollController::class, 'store'])->name('store');
        Route::post('{period}/run', [PayrollController::class, 'run'])->name('run');
        Route::post('{period}/hold', [PayrollController::class, 'hold'])->name('hold');
        Route::post('{period}/release', [PayrollController::class, 'release'])->name('release');
    });
    Route::post('{period}/approve', [PayrollController::class, 'approve'])->middleware('permission:payroll.approve')->name('approve');
    Route::post('{period}/finalize', [PayrollController::class, 'finalize'])->middleware('permission:payroll.finalize')->name('finalize');
});

Route::get('api/payroll-inputs/{period}', [PayrollInputsController::class, 'show'])->middleware('permission:payroll.inputs.view')->name('payroll-inputs.show');
