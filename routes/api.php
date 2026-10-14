<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PayrollController;
use Illuminate\Support\Facades\Route;

// The public read API, under /api/v1 and called with an API key (`Authorization: Bearer fbs_...`). It reuses the controllers and
// resources of the app, so a key sees exactly what the user who made it sees, cut down to the abilities picked for the key.
// A route needs the key's ability and, as the user, the capability of the same screen.
Route::prefix('v1')->name('api.v1.')->middleware(['auth:sanctum', 'active', 'throttle:api-keys'])->group(function () {
    Route::middleware(['permission:employees.view', 'api.key:employees.read'])->group(function () {
        Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
        Route::get('employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    });

    Route::get('attendance', [AttendanceController::class, 'index'])->middleware(['permission:attendance.view', 'api.key:attendance.read'])->name('attendance.index');

    Route::middleware(['permission:payroll.view', 'api.key:payroll.read'])->group(function () {
        Route::get('payroll', [PayrollController::class, 'index'])->name('payroll.index');
        Route::get('payroll/{period}/lines', [PayrollController::class, 'lines'])->name('payroll.lines');
    });
});
