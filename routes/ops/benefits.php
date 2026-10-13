<?php

use App\Http\Controllers\BenefitController;
use App\Http\Controllers\DeductionController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/benefits')->name('benefits.')->group(function () {
    Route::middleware('permission:loans.view')->group(function () {
        Route::get('/', [BenefitController::class, 'index'])->name('index');
        Route::get('plans', [BenefitController::class, 'plans'])->name('plans.index');
    });
    Route::middleware('permission:loans.manage')->group(function () {
        Route::post('/', [BenefitController::class, 'store'])->name('store');
        Route::put('{employeeBenefit}', [BenefitController::class, 'update'])->name('update');
        Route::post('plans', [BenefitController::class, 'storePlan'])->name('plans.store');
        Route::post('plans/transfer', [BenefitController::class, 'transfer'])->name('plans.transfer');
        Route::put('plans/{benefitPlan}', [BenefitController::class, 'updatePlan'])->name('plans.update');
        Route::post('plans/{benefitPlan}/status', [BenefitController::class, 'setPlanStatus'])->name('plans.status');
        Route::post('plans/{benefitPlan}/enroll', [BenefitController::class, 'enroll'])->name('plans.enroll');
    });
});

Route::prefix('api/deductions')->name('deductions.')->group(function () {
    Route::middleware('permission:loans.view')->group(function () {
        Route::get('/', [DeductionController::class, 'index'])->name('index');
        Route::get('plans', [DeductionController::class, 'plans'])->name('plans.index');
    });
    Route::middleware('permission:loans.manage')->group(function () {
        Route::post('/', [DeductionController::class, 'store'])->name('store');
        Route::put('{employeeDeduction}', [DeductionController::class, 'update'])->name('update');
        Route::post('plans', [DeductionController::class, 'storePlan'])->name('plans.store');
        Route::post('plans/transfer', [DeductionController::class, 'transfer'])->name('plans.transfer');
        Route::put('plans/{deductionPlan}', [DeductionController::class, 'updatePlan'])->name('plans.update');
        Route::post('plans/{deductionPlan}/status', [DeductionController::class, 'setPlanStatus'])->name('plans.status');
        Route::post('plans/{deductionPlan}/enroll', [DeductionController::class, 'enroll'])->name('plans.enroll');
    });
});
