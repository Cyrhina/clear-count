<?php

use App\Http\Controllers\AttendanceAdjustmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\WfhController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/attendance')->name('attendance.')->group(function () {
    // Self-service reads their own through the employee scope.
    Route::get('/', [AttendanceController::class, 'index'])->middleware('permission:attendance.view|ess.view')->name('index');

    Route::middleware('permission:attendance.view')->group(function () {
        Route::get('late-dates', [AttendanceController::class, 'lateDates'])->name('late-dates');
        Route::get('adjustments', [AttendanceAdjustmentController::class, 'index'])->name('adjustments.index');
    });

    Route::middleware('permission:attendance.adjust')->group(function () {
        Route::post('log', [AttendanceController::class, 'log'])->name('log');
        Route::post('adjustments', [AttendanceAdjustmentController::class, 'store'])->name('adjustments.store');
    });

    Route::post('biometrics', [AttendanceController::class, 'biometrics'])->middleware('permission:attendance.import')->name('biometrics');
    Route::post('adjustments/decide', [AttendanceAdjustmentController::class, 'decide'])->middleware('permission:attendance.approve')->name('adjustments.decide');
});

// Work from home. Anyone with self-service may ask for themselves; the rest is HR and managers.
Route::prefix('api/wfh')->name('wfh.')->group(function () {
    Route::get('/', [WfhController::class, 'index'])->middleware('permission:attendance.view|ess.view')->name('index');
    Route::post('/', [WfhController::class, 'store'])->middleware('permission:attendance.adjust|ess.view')->name('store');
    Route::post('cancel', [WfhController::class, 'cancel'])->middleware('permission:attendance.adjust|ess.view')->name('cancel');
    Route::post('preview', [WfhController::class, 'preview'])->middleware('permission:attendance.adjust')->name('preview');
    Route::post('end', [WfhController::class, 'end'])->middleware('permission:attendance.adjust')->name('end');
    Route::post('decide', [WfhController::class, 'decide'])->middleware('permission:attendance.adjust')->name('decide');
    Route::put('limit', [WfhController::class, 'setLimit'])->middleware('permission:attendance.approve')->name('limit');
});
