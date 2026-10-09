<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\CompanyInfoController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OpsController;
use App\Http\Controllers\PayrollGroupController;
use App\Http\Controllers\PayrollSettingsController;
use App\Http\Controllers\PermissionMapController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Home goes to login; signed-in users are bounced on to their landing page by Fortify's guest middleware.
Route::redirect('/', '/login')->name('home');

// `ops` => rendered through the ops root view (separate CSS/app from the starter-kit pages).
Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::group(['ops' => true], function () {
        Route::get('dashboard', [OpsController::class, 'dashboard'])->middleware('permission:dashboard.view')->name('dashboard');
        Route::get('my-profile', [OpsController::class, 'myProfile'])->middleware('permission:profile.view')->name('my-profile');
        Route::get('employees', [OpsController::class, 'employees'])->middleware('permission:employees.view')->name('employees.index');
        Route::get('employees/{id}', [OpsController::class, 'employee'])->middleware('permission:employees.view')->name('employees.show');
        Route::get('attendance', [OpsController::class, 'attendance'])->middleware('permission:attendance.view')->name('attendance');
        Route::get('schedules', [OpsController::class, 'schedules'])->middleware('permission:schedules.view')->name('schedules');
        Route::get('overtime', [OpsController::class, 'overtime'])->middleware('permission:overtime.view')->name('overtime');
        Route::get('approvals', [OpsController::class, 'approvals'])->middleware('permission:compensation_approvals.manage')->name('approvals');
        Route::get('leave', [OpsController::class, 'leave'])->middleware('permission:leave.view')->name('leave');
        Route::get('payroll', [OpsController::class, 'payrollIndex'])->middleware('permission:payroll.view')->name('payroll.index');
        Route::get('payroll/{id}', [OpsController::class, 'payrollShow'])->middleware('permission:payroll.view')->name('payroll.show');
        Route::get('payroll-inputs', [OpsController::class, 'payrollInputs'])->middleware('permission:payroll.inputs.view')->name('payroll.inputs');
        Route::get('bonuses', [OpsController::class, 'bonusesIndex'])->middleware('permission:bonuses.view')->name('bonuses.index');
        Route::get('bonuses/{bonusId}/payslips/{employeeId}', [OpsController::class, 'bonusPayslip'])->middleware('permission:bonuses.view')->name('bonuses.payslip');
        Route::get('thirteenth-month-pay', [OpsController::class, 'thirteenthIndex'])->middleware('permission:thirteenth_month.view')->name('thirteenth.index');
        Route::get('thirteenth-month-pay/{runId}/payslips/{employeeId}', [OpsController::class, 'thirteenthPayslip'])->middleware('permission:thirteenth_month.view')->name('thirteenth.payslip');
        Route::get('payslips', [OpsController::class, 'payslipsIndex'])->middleware('permission:payslips.view')->name('payslips.index');
        Route::get('payslips/{lineId}', [OpsController::class, 'payslipsShow'])->middleware('permission:payslips.view')->name('payslips.show');
        Route::get('statutory', [OpsController::class, 'statutory'])->middleware('permission:statutory.view')->name('statutory');
        Route::get('loans-deductions', [OpsController::class, 'loans'])->middleware('permission:loans.view')->name('loans');
        Route::get('ess', [OpsController::class, 'essHome'])->middleware('permission:ess.view')->name('ess.home');
        Route::get('ess/profile', [OpsController::class, 'essProfile'])->middleware('permission:ess.view')->name('ess.profile');
        Route::get('ess/payslips', [OpsController::class, 'essPayslips'])->middleware('permission:ess.view')->name('ess.payslips');
        Route::get('ess/payslips/{lineId}', [OpsController::class, 'essPayslipsShow'])->middleware('permission:ess.view')->name('ess.payslips.show');
        Route::get('ess/attendance', [OpsController::class, 'essAttendance'])->middleware('permission:ess.view')->name('ess.attendance');
        Route::get('ess/overtime', [OpsController::class, 'essOvertime'])->middleware('permission:ess.view')->name('ess.overtime');
        Route::get('ess/schedule', [OpsController::class, 'essSchedule'])->middleware('permission:ess.view')->name('ess.schedule');
        Route::get('ess/work-output', [OpsController::class, 'essWorkOutput'])->middleware('permission:ess.view')->name('ess.work-output');
        Route::get('ess/leave', [OpsController::class, 'essLeave'])->middleware('permission:ess.view')->name('ess.leave');
        Route::get('ess/loans', [OpsController::class, 'essLoans'])->middleware('permission:ess.view')->name('ess.loans');
        Route::get('notifications', [OpsController::class, 'notifications'])->middleware('permission:notifications.view')->name('notifications');
        Route::get('reports', [OpsController::class, 'reportsIndex'])->middleware('permission:reports.view')->name('reports.index');
        Route::get('reports/{reportId}', [OpsController::class, 'reportsShow'])->middleware('permission:reports.view')->name('reports.show');
        Route::get('insights', [OpsController::class, 'insights'])->middleware('permission:insights.view')->name('insights');
        Route::get('user-access', [OpsController::class, 'userAccess'])->middleware('permission:users.manage')->name('user-access');
        Route::get('company-settings', [OpsController::class, 'companySettings'])->middleware('permission:settings.company.edit')->name('company-settings');
        Route::get('onboarding', [OpsController::class, 'onboarding'])->middleware('permission:onboarding.manage')->name('onboarding');
        Route::get('branches', [OpsController::class, 'branches'])->middleware('permission:branches.manage')->name('branches');
        Route::get('subscription', [OpsController::class, 'subscription'])->middleware('permission:subscription.manage')->name('subscription');
        Route::get('integrations', [OpsController::class, 'integrations'])->middleware('permission:integrations.manage')->name('integrations');
        Route::get('platform/companies', [OpsController::class, 'platformCompanies'])->middleware('permission:platform.admin')->name('platform.companies');
        Route::get('forbidden', [OpsController::class, 'forbidden'])->name('forbidden');
    });

    Route::middleware('permission:employees.edit')->group(function () {
        Route::post('employees', [EmployeeController::class, 'store'])->name('employees.store');
        Route::put('employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    });

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

    // Company Info tab of Company & Payroll Settings. POST is accepted too because PHP does not parse multipart bodies on PUT.
    Route::prefix('api/company-info')->name('company-info.')->middleware('permission:settings.company.edit')->group(function () {
        Route::get('/', [CompanyInfoController::class, 'show'])->name('show');
        Route::match(['put', 'post'], '/', [CompanyInfoController::class, 'update'])->name('update');
        Route::post('logo', [CompanyInfoController::class, 'uploadLogo'])->name('logo.store');
        Route::delete('logo', [CompanyInfoController::class, 'removeLogo'])->name('logo.destroy');
    });

    // Activity Log tab (read-only).
    Route::prefix('api/activity-logs')->name('activity-logs.')->middleware('permission:users.manage')->group(function () {
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        Route::get('filters', [ActivityLogController::class, 'filters'])->name('filters');
        Route::get('{activityLog}', [ActivityLogController::class, 'show'])->name('show');
    });

    // Permission Map tab (read-only).
    Route::prefix('api/permission-map')->name('permission-map.')->middleware('permission:users.manage')->group(function () {
        Route::get('/', [PermissionMapController::class, 'index'])->name('index');
        Route::get('capabilities', [PermissionMapController::class, 'capabilities'])->name('capabilities');
        Route::get('{role}', [PermissionMapController::class, 'show'])->name('show');
    });

    // Users tab of User & Access Management (JSON; the `api/` prefix also makes errors render as JSON).
    Route::prefix('api/users')->name('users.')->middleware('permission:users.manage')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::patch('{user}/role', [UserController::class, 'updateRole'])->name('role');
        Route::patch('{user}/status', [UserController::class, 'toggleStatus'])->name('status');
        Route::post('{user}/invite', [UserController::class, 'resendInvite'])->name('invite');
        Route::post('{user}/reset-access', [UserController::class, 'resetAccess'])->name('reset-access');
    });
});

require __DIR__.'/settings.php';
