<?php

use App\Http\Controllers\PermissionMapController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Permission Map tab (read-only).
Route::prefix('api/permission-map')->name('permission-map.')->middleware('permission:users.manage')->group(function () {
    Route::get('/', [PermissionMapController::class, 'index'])->name('index');
    Route::get('capabilities', [PermissionMapController::class, 'capabilities'])->name('capabilities');
    Route::get('{role}', [PermissionMapController::class, 'show'])->name('show');
});
