<?php

use App\Http\Controllers\OpsController;
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
        Route::get('company-settings', [OpsController::class, 'companySettings'])->middleware('permission:settings.company.edit|settings.payroll.edit')->name('company-settings');
        Route::get('onboarding', [OpsController::class, 'onboarding'])->middleware('permission:onboarding.manage')->name('onboarding');
        Route::get('branches', [OpsController::class, 'branches'])->middleware('permission:branches.manage')->name('branches');
        Route::get('subscription', [OpsController::class, 'subscription'])->middleware('permission:subscription.manage')->name('subscription');
        Route::get('integrations', [OpsController::class, 'integrations'])->middleware('permission:integrations.manage')->name('integrations');
        Route::get('platform/companies', [OpsController::class, 'platformCompanies'])->middleware('permission:platform.admin')->name('platform.companies');
        Route::get('forbidden', [OpsController::class, 'forbidden'])->name('forbidden');
    });

    // JSON API modules: one file per module in routes/ops/ (shared middleware comes from this group).
    foreach (['employees', 'payroll-settings', 'holidays', 'company-info', 'activity-logs', 'permission-map', 'users', 'branches', 'schedules', 'attendance', 'leave', 'overtime', 'notifications', 'statutory'] as $module) {
        require __DIR__."/ops/{$module}.php";
    }
});

require __DIR__.'/settings.php';
