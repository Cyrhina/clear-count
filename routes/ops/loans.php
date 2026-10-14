<?php

use App\Http\Controllers\LoanController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/loans')->name('loans.')->group(function () {
    // Self-service reads their own through the employee scope.
    Route::get('/', [LoanController::class, 'index'])->middleware('permission:loans.view|ess.view')->name('index');
    Route::middleware('permission:loans.view')->group(function () {
        Route::get('types', [LoanController::class, 'types'])->name('types.index');
    });
    Route::middleware('permission:loans.manage')->group(function () {
        Route::post('/', [LoanController::class, 'store'])->name('store');
        Route::post('bulk', [LoanController::class, 'storeMany'])->name('bulk');
        Route::post('types', [LoanController::class, 'storeType'])->name('types.store');
        Route::put('types/{loanType}', [LoanController::class, 'updateType'])->name('types.update');
        Route::delete('types/{loanType}', [LoanController::class, 'destroyType'])->name('types.destroy');
        Route::put('{loan}', [LoanController::class, 'update'])->name('update');
        Route::post('{loan}/status', [LoanController::class, 'setStatus'])->name('status');
    });
});
