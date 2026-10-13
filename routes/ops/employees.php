<?php

use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// The employee record. One endpoint per section, each behind its own capability.
Route::prefix('api/employees')->name('api.employees.')->group(function () {
    Route::middleware('permission:employees.view')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->name('index');
        Route::get('{employee}', [EmployeeController::class, 'show'])->name('show');
    });

    Route::middleware('permission:employees.edit')->group(function () {
        Route::post('/', [EmployeeController::class, 'store'])->name('store');
        Route::put('{employee}/personal', [EmployeeController::class, 'updatePersonal'])->name('personal');
        Route::put('{employee}/employment', [EmployeeController::class, 'updateEmployment'])->name('employment');
        Route::put('{employee}/benefits', [EmployeeController::class, 'updateBenefits'])->name('benefits');
    });

    Route::put('{employee}/compensation', [EmployeeController::class, 'updateCompensation'])->middleware('permission:employees.compensation.edit')->name('compensation');
    Route::put('{employee}/government', [EmployeeController::class, 'updateGovernment'])->middleware('permission:employees.government.edit')->name('government');
    Route::put('{employee}/bank', [EmployeeController::class, 'updateBank'])->middleware('permission:employees.bank.edit')->name('bank');
    Route::put('{employee}/status', [EmployeeController::class, 'updateStatus'])->middleware('permission:employees.separate')->name('status');
    Route::post('{employee}/account', [EmployeeController::class, 'createAccount'])->middleware('permission:users.manage')->name('account');
});
