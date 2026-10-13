<?php

use App\Http\Controllers\StatutoryController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

Route::prefix('api/statutory')->name('statutory.')->group(function () {
    Route::get('/', [StatutoryController::class, 'show'])->middleware('permission:statutory.view')->name('show');
    Route::get('employees', [StatutoryController::class, 'employees'])->middleware('permission:statutory.view')->name('employees');
    Route::post('preview', [StatutoryController::class, 'preview'])->middleware('permission:statutory.view')->name('preview');
    Route::put('/', [StatutoryController::class, 'update'])->middleware('permission:statutory.edit')->name('update');
});
