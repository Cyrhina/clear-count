<?php

use App\Http\Controllers\HolidayController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Holidays tab of Company & Payroll Settings.
Route::prefix('api/holidays')->name('holidays.')->middleware('permission:settings.company.edit')->group(function () {
    Route::get('/', [HolidayController::class, 'index'])->name('index');
    Route::post('/', [HolidayController::class, 'store'])->name('store');
    Route::post('import-defaults', [HolidayController::class, 'bulkImportDefaults'])->name('import-defaults');
    Route::put('{holiday}', [HolidayController::class, 'update'])->name('update');
    Route::delete('{holiday}', [HolidayController::class, 'destroy'])->name('destroy');
});
