<?php

use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::middleware('permission:employees.edit')->group(function () {
    Route::post('employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::put('employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
});
