<?php

use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/integrations')->name('api.integrations.')->middleware('permission:integrations.manage')->group(function () {
    Route::get('api-keys', [ApiKeyController::class, 'index'])->name('keys.index');
    Route::post('api-keys', [ApiKeyController::class, 'store'])->name('keys.store');
    Route::delete('api-keys/{key}', [ApiKeyController::class, 'destroy'])->whereNumber('key')->name('keys.destroy');

    Route::get('webhooks', [WebhookController::class, 'index'])->name('webhooks.index');
    Route::post('webhooks', [WebhookController::class, 'store'])->name('webhooks.store');
    Route::patch('webhooks/{endpoint}', [WebhookController::class, 'update'])->name('webhooks.update');
    Route::delete('webhooks/{endpoint}', [WebhookController::class, 'destroy'])->name('webhooks.destroy');
    Route::get('webhooks/{endpoint}/deliveries', [WebhookController::class, 'deliveries'])->name('webhooks.deliveries');
    Route::post('webhook-deliveries/{delivery}/retry', [WebhookController::class, 'retry'])->name('webhooks.retry');
});
