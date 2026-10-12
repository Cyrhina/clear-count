<?php

use App\Http\Controllers\CompanyInfoController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// Company Info tab of Company & Payroll Settings. POST is accepted too because PHP does not parse multipart bodies on PUT.
Route::prefix('api/company-info')->name('company-info.')->middleware('permission:settings.company.edit')->group(function () {
    Route::get('/', [CompanyInfoController::class, 'show'])->name('show');
    Route::match(['put', 'post'], '/', [CompanyInfoController::class, 'update'])->name('update');
    Route::post('logo', [CompanyInfoController::class, 'uploadLogo'])->name('logo.store');
    Route::delete('logo', [CompanyInfoController::class, 'removeLogo'])->name('logo.destroy');
});
