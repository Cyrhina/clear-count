<?php

use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Activity Log tab (read-only).
Route::prefix('api/activity-logs')->name('activity-logs.')->middleware('permission:users.manage')->group(function () {
    Route::get('/', [ActivityLogController::class, 'index'])->name('index');
    Route::get('filters', [ActivityLogController::class, 'filters'])->name('filters');
    Route::get('{activityLog}', [ActivityLogController::class, 'show'])->name('show');
});
