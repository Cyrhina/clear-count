<?php

use App\Http\Controllers\BonusController;
use App\Http\Controllers\BonusPayslipController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/bonuses')->name('bonuses.')->group(function () {
    Route::get('/', [BonusController::class, 'index'])->middleware('permission:bonuses.view')->name('index');
    Route::get('{bonus}/payslips', [BonusPayslipController::class, 'index'])->middleware('permission:bonuses.view')->name('payslips');
    Route::get('{bonus}/payslips/{employee}/pdf', [BonusPayslipController::class, 'pdf'])->middleware('permission:bonuses.view')->name('payslips.pdf');
    Route::middleware('permission:bonuses.manage')->group(function () {
        Route::post('/', [BonusController::class, 'store'])->name('store');
        Route::put('{bonus}', [BonusController::class, 'update'])->name('update');
        Route::post('{bonus}/submit', [BonusController::class, 'submit'])->name('submit');
        Route::post('{bonus}/decision', [BonusController::class, 'decide'])->name('decide');
    });
});
