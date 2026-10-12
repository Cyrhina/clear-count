<?php

use App\Http\Controllers\PayrollGroupController;
use App\Http\Controllers\PayrollSettingsController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Payroll Settings: groups, earnings, deductions, overtime & holiday rates, rules, work schedules.
Route::prefix('api/payroll-settings')->name('payroll-settings.')->middleware('permission:settings.payroll.edit')->group(function () {
    Route::get('payroll-groups', [PayrollGroupController::class, 'index'])->name('groups.index');
    Route::post('payroll-groups', [PayrollGroupController::class, 'store'])->name('groups.store');
    Route::get('payroll-groups/{payrollGroup}', [PayrollGroupController::class, 'show'])->name('groups.show');
    Route::put('payroll-groups/{payrollGroup}', [PayrollGroupController::class, 'update'])->name('groups.update');
    Route::delete('payroll-groups/{payrollGroup}', [PayrollGroupController::class, 'destroy'])->name('groups.destroy');
    Route::post('payroll-groups/{payrollGroup}/employees', [PayrollGroupController::class, 'assignEmployees'])->name('groups.employees');
    Route::get('payroll-groups/{payrollGroup}/calendar', [PayrollGroupController::class, 'calendar'])->name('groups.calendar');

    Route::get('earnings', [PayrollSettingsController::class, 'earnings'])->name('earnings.index');
    Route::post('earnings', [PayrollSettingsController::class, 'storeEarning'])->name('earnings.store');
    Route::put('earnings/{earningType}', [PayrollSettingsController::class, 'updateEarning'])->name('earnings.update');
    Route::delete('earnings/{earningType}', [PayrollSettingsController::class, 'destroyEarning'])->name('earnings.destroy');

    Route::get('deductions', [PayrollSettingsController::class, 'deductions'])->name('deductions.index');
    Route::post('deductions', [PayrollSettingsController::class, 'storeDeduction'])->name('deductions.store');
    Route::put('deductions/{deductionType}', [PayrollSettingsController::class, 'updateDeduction'])->name('deductions.update');
    Route::delete('deductions/{deductionType}', [PayrollSettingsController::class, 'destroyDeduction'])->name('deductions.destroy');

    Route::get('overtime-rates', [PayrollSettingsController::class, 'overtimeRates'])->name('overtime-rates.index');
    Route::post('overtime-rates', [PayrollSettingsController::class, 'storeOvertimeRate'])->name('overtime-rates.store');
    Route::put('overtime-rates/{overtimeRate}', [PayrollSettingsController::class, 'updateOvertimeRate'])->name('overtime-rates.update');
    Route::delete('overtime-rates/{overtimeRate}', [PayrollSettingsController::class, 'destroyOvertimeRate'])->name('overtime-rates.destroy');

    Route::get('rules', [PayrollSettingsController::class, 'rules'])->name('rules.show');
    Route::put('rules', [PayrollSettingsController::class, 'updateRules'])->name('rules.update');

    Route::get('work-schedules', [PayrollSettingsController::class, 'workSchedules'])->name('work-schedules.index');
    Route::post('work-schedules', [PayrollSettingsController::class, 'storeWorkSchedule'])->name('work-schedules.store');
    Route::put('work-schedules/{workSchedule}', [PayrollSettingsController::class, 'updateWorkSchedule'])->name('work-schedules.update');
    Route::delete('work-schedules/{workSchedule}', [PayrollSettingsController::class, 'destroyWorkSchedule'])->name('work-schedules.destroy');
});
