<?php

use App\Http\Controllers\HolidayController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Holidays tab of Company & Payroll Settings. Payroll admins can read the calendar (payroll uses it); only company admins change it.
Route::prefix('api/holidays')->name('holidays.')->group(function () {
    Route::get('/', [HolidayController::class, 'index'])->middleware('permission:settings.company.edit|settings.payroll.edit')->name('index');

    Route::middleware('permission:settings.company.edit')->group(function () {
        Route::post('/', [HolidayController::class, 'store'])->name('store');
        Route::post('import-defaults', [HolidayController::class, 'bulkImportDefaults'])->name('import-defaults');
        Route::put('{holiday}', [HolidayController::class, 'update'])->name('update');
        Route::delete('{holiday}', [HolidayController::class, 'destroy'])->name('destroy');
    });
});
