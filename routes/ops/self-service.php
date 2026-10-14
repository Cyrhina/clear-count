<?php

use App\Http\Controllers\ManagerDashboardController;
use App\Http\Controllers\MeController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// The signed-in person's own record. Only the contact fields can be changed here.
Route::get('api/me', [MeController::class, 'show'])->middleware('permission:ess.view|profile.view')->name('api.me.show');
Route::patch('api/me', [MeController::class, 'update'])->middleware('permission:ess.view|profile.view')->name('api.me.update');

Route::get('api/manager/dashboard', ManagerDashboardController::class)->middleware('permission:attendance.view')->name('api.manager.dashboard');
