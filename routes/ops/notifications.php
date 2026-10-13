<?php

use App\Http\Controllers\ApprovalSummaryController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/notifications')->name('notifications.')->middleware('permission:notifications.view')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::post('read-all', [NotificationController::class, 'readAll'])->name('read-all');
    Route::post('{id}/read', [NotificationController::class, 'read'])->name('read');
});

Route::get('api/approvals/summary', ApprovalSummaryController::class)->middleware('permission:approvals.view')->name('approvals.summary');
