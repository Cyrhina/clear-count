<?php

use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\WorkLogController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/overtime')->name('overtime.')->group(function () {
    Route::get('/', [OvertimeController::class, 'index'])->middleware('permission:overtime.view|ess.view')->name('index');
    // Self-service files their own: the employee scope returns 404 for anyone else.
    Route::post('/', [OvertimeController::class, 'store'])->middleware('permission:overtime.log|ess.view')->name('store');
    Route::get('rates', [OvertimeController::class, 'rates'])->middleware('permission:overtime.view|overtime.log|ess.view')->name('rates');
    Route::delete('{overtime}', [OvertimeController::class, 'destroy'])->middleware('permission:overtime.log|ess.view')->name('destroy');
    Route::post('decide', [OvertimeController::class, 'decide'])->middleware('permission:overtime.approve')->name('decide');
});

Route::prefix('api/work-logs')->name('work-logs.')->group(function () {
    Route::get('/', [WorkLogController::class, 'index'])->middleware('permission:compensation_approvals.manage|ess.view')->name('index');
    Route::post('/', [WorkLogController::class, 'store'])->middleware('permission:compensation_approvals.manage|ess.view')->name('store');
    Route::delete('{workLog}', [WorkLogController::class, 'destroy'])->middleware('permission:compensation_approvals.manage|ess.view')->name('destroy');
    Route::post('decide', [WorkLogController::class, 'decide'])->middleware('permission:compensation_approvals.manage')->name('decide');
});
