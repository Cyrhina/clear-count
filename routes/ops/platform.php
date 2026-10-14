<?php

use App\Http\Controllers\PlatformController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// The company's plan, usage, downgrade and upgrade payments.
Route::prefix('api/subscription')->name('api.subscription.')->group(function () {
    Route::middleware('permission:subscription.manage')->group(function () {
        Route::get('/', [SubscriptionController::class, 'show'])->name('show');
        Route::get('quote/{tier}', [SubscriptionController::class, 'quote'])->name('quote');
        Route::post('downgrade', [SubscriptionController::class, 'downgrade'])->name('downgrade');
        Route::post('payments', [SubscriptionController::class, 'storePayment'])->name('payments.store');
    });
    // The company that paid and the super admin may open the receipt photo.
    Route::get('payments/{payment}/proof', [SubscriptionController::class, 'proof'])->middleware('permission:subscription.manage|platform.admin')->name('payments.proof');
});

// The super admin's view of every company and the payments to verify.
Route::prefix('api/platform')->name('api.platform.')->middleware('permission:platform.admin')->group(function () {
    Route::get('dashboard', [PlatformController::class, 'dashboard'])->name('dashboard');
    Route::get('companies', [PlatformController::class, 'companies'])->name('companies.index');
    Route::post('companies', [PlatformController::class, 'storeCompany'])->name('companies.store');
    Route::patch('companies/{company}/status', [PlatformController::class, 'setStatus'])->name('companies.status');
    Route::patch('companies/{company}/plan', [PlatformController::class, 'setPlan'])->name('companies.plan');
    Route::get('payments', [PlatformController::class, 'payments'])->name('payments.index');
    Route::post('payments/{payment}/decision', [PlatformController::class, 'decidePayment'])->name('payments.decision');
});
