<?php

use App\Http\Controllers\AttendanceAdjustmentController;
use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/attendance')->name('attendance.')->group(function () {
    Route::middleware('permission:attendance.view')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
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
