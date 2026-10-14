<?php

use App\Http\Controllers\ThirteenthMonthController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/thirteenth-month')->name('thirteenth-month.')->group(function () {
    Route::middleware('permission:thirteenth_month.view')->group(function () {
        Route::get('/', [ThirteenthMonthController::class, 'index'])->name('index');
        Route::post('preview', [ThirteenthMonthController::class, 'preview'])->name('preview');
        Route::get('{run}/lines', [ThirteenthMonthController::class, 'lines'])->name('lines');
    });
    Route::middleware('permission:thirteenth_month.manage')->group(function () {
        Route::post('/', [ThirteenthMonthController::class, 'generate'])->name('generate');
        Route::post('{run}/finalize', [ThirteenthMonthController::class, 'finalize'])->name('finalize');
    });
    Route::get('lines/{line}/pdf', [ThirteenthMonthController::class, 'pdf'])->middleware('permission:thirteenth_month.view|ess.view')->name('pdf');
});
