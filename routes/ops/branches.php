<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\BranchDepartmentController;
use App\Http\Controllers\OnboardingController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// The employee list filters by branch and department, so anyone who can open it may read them.
Route::get('api/branches', [BranchController::class, 'index'])->middleware('permission:branches.manage|employees.view|reports.view|payroll.view')->name('branches.index');
Route::get('api/branch-departments', [BranchDepartmentController::class, 'index'])->middleware('permission:branches.manage|employees.view')->name('branch-departments.index');

Route::middleware('permission:branches.manage')->group(function () {
    Route::get('api/branches/summaries', [BranchController::class, 'summaries'])->name('branches.summaries');
    Route::post('api/branches', [BranchController::class, 'store'])->name('branches.store');
    Route::put('api/branches/{branch}', [BranchController::class, 'update'])->name('branches.update');
    Route::delete('api/branches/{branch}', [BranchController::class, 'destroy'])->name('branches.destroy');

    Route::prefix('api/branch-departments')->name('branch-departments.')->group(function () {
        Route::post('/', [BranchDepartmentController::class, 'store'])->name('store');
        Route::post('copy', [BranchDepartmentController::class, 'copy'])->name('copy');
        Route::put('{department}', [BranchDepartmentController::class, 'update'])->name('update');
        Route::delete('{department}', [BranchDepartmentController::class, 'destroy'])->name('destroy');
        Route::put('{department}/supervisor', [BranchDepartmentController::class, 'setSupervisor'])->name('supervisor');
    });
});

Route::get('api/onboarding', [OnboardingController::class, 'index'])->middleware('permission:onboarding.manage')->name('onboarding.index');
