<?php

use App\Http\Controllers\LeaveController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/leave')->name('leave.')->group(function () {
    // Self-service reads their own through the employee scope.
    Route::middleware('permission:leave.view|ess.view')->group(function () {
        Route::get('types', [LeaveController::class, 'types'])->name('types.index');
        Route::get('requests', [LeaveController::class, 'requests'])->name('requests.index');
        Route::get('balances', [LeaveController::class, 'balances'])->name('balances');
    });

    // Self-service files and cancels their own; the controller refuses anyone else's without `leave.request`.
    Route::middleware('permission:leave.request|ess.view')->group(function () {
        Route::post('requests/preview', [LeaveController::class, 'preview'])->name('requests.preview');
        Route::post('requests', [LeaveController::class, 'store'])->name('requests.store');
        Route::post('requests/{leaveRequest}/cancel', [LeaveController::class, 'cancel'])->name('requests.cancel');
    });

    Route::post('requests/decide', [LeaveController::class, 'decide'])->middleware('permission:leave.approve')->name('requests.decide');

    Route::middleware('permission:leave.manage_types')->group(function () {
        Route::post('types', [LeaveController::class, 'storeType'])->name('types.store');
        Route::put('types/{leaveType}', [LeaveController::class, 'updateType'])->name('types.update');
        Route::post('credits', [LeaveController::class, 'grantCredits'])->name('credits');
    });
});
