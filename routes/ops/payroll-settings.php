<?php

use App\Http\Controllers\CompensationTypeController;
use App\Http\Controllers\ComplianceDeadlineController;
use App\Http\Controllers\PayrollGroupController;
use App\Http\Controllers\PayrollSettingsController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Payroll groups can be read by anyone who opens the employee profile (it shows and assigns the group).
Route::prefix('api/payroll-settings/payroll-groups')->middleware('permission:settings.payroll.edit|employees.view')->group(function () {
    Route::get('/', [PayrollGroupController::class, 'index'])->name('payroll-settings.groups.index');
    Route::get('{payrollGroup}', [PayrollGroupController::class, 'show'])->name('payroll-settings.groups.show');
});

// Payroll Settings: groups, earnings, deductions, overtime & holiday rates, rules, work schedules.
Route::prefix('api/payroll-settings')->name('payroll-settings.')->middleware('permission:settings.payroll.edit')->group(function () {
    Route::post('payroll-groups', [PayrollGroupController::class, 'store'])->name('groups.store');
    Route::put('payroll-groups/{payrollGroup}', [PayrollGroupController::class, 'update'])->name('groups.update');
    Route::delete('payroll-groups/{payrollGroup}', [PayrollGroupController::class, 'destroy'])->name('groups.destroy');
    Route::post('payroll-groups/{payrollGroup}/employees', [PayrollGroupController::class, 'assignEmployees'])->name('groups.employees');
    Route::get('payroll-groups/{payrollGroup}/calendar', [PayrollGroupController::class, 'calendar'])->name('groups.calendar');

    Route::get('compensation-types', [CompensationTypeController::class, 'index'])->name('compensation-types.index');
    Route::post('compensation-types', [CompensationTypeController::class, 'store'])->name('compensation-types.store');
    Route::put('compensation-types/{compensationType}', [CompensationTypeController::class, 'update'])->name('compensation-types.update');

    Route::get('compliance-deadlines', [ComplianceDeadlineController::class, 'index'])->name('compliance-deadlines.index');
    Route::post('compliance-deadlines', [ComplianceDeadlineController::class, 'store'])->name('compliance-deadlines.store');
    Route::put('compliance-deadlines/{complianceDeadline}', [ComplianceDeadlineController::class, 'update'])->name('compliance-deadlines.update');
    Route::delete('compliance-deadlines/{complianceDeadline}', [ComplianceDeadlineController::class, 'destroy'])->name('compliance-deadlines.destroy');

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
