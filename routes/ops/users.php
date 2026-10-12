<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Users tab of User & Access Management (JSON; the `api/` prefix also makes errors render as JSON).
Route::prefix('api/users')->name('users.')->middleware('permission:users.manage')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::patch('{user}/role', [UserController::class, 'updateRole'])->name('role');
    Route::patch('{user}/status', [UserController::class, 'toggleStatus'])->name('status');
    Route::post('{user}/invite', [UserController::class, 'resendInvite'])->middleware('throttle:user-mail')->name('invite');
    Route::post('{user}/reset-access', [UserController::class, 'resetAccess'])->middleware('throttle:user-mail')->name('reset-access');
});
