<?php

use App\Http\Controllers\ShiftRosterController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/schedules')->name('schedules.')->group(function () {
    Route::middleware('permission:schedules.view')->group(function () {
        Route::get('templates', [ShiftRosterController::class, 'templates'])->name('templates');
        Route::get('roster', [ShiftRosterController::class, 'index'])->name('roster');
    });

    Route::middleware('permission:schedules.manage')->group(function () {
        Route::post('roster', [ShiftRosterController::class, 'assign'])->name('assign');
        Route::post('roster/clear', [ShiftRosterController::class, 'clear'])->name('clear');
        Route::post('roster/copy-week', [ShiftRosterController::class, 'copyWeek'])->name('copy-week');
    });
});
