<?php

use App\Http\Controllers\EmployeeBulkController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDocumentController;
use Illuminate\Support\Facades\Route;

// Required inside the auth + verified + active group in routes/web.php.

// The employee record. One endpoint per section, each behind its own capability.
Route::prefix('api/employees')->name('api.employees.')->group(function () {
    Route::middleware('permission:employees.view')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->name('index');
        Route::get('{employee}', [EmployeeController::class, 'show'])->name('show');
    });

    Route::middleware('permission:employees.edit')->group(function () {
        Route::post('/', [EmployeeController::class, 'store'])->name('store');
        Route::post('import', [EmployeeBulkController::class, 'import'])->name('import');
        Route::post('bulk/department', [EmployeeBulkController::class, 'department'])->name('bulk.department');
        Route::post('bulk/branch', [EmployeeBulkController::class, 'branch'])->name('bulk.branch');
        Route::post('{employee}/documents', [EmployeeDocumentController::class, 'store'])->name('documents.store');
        Route::delete('{employee}/documents/{document}', [EmployeeDocumentController::class, 'destroy'])->name('documents.destroy');
        Route::put('{employee}/personal', [EmployeeController::class, 'updatePersonal'])->name('personal');
        Route::put('{employee}/employment', [EmployeeController::class, 'updateEmployment'])->name('employment');
        Route::put('{employee}/benefits', [EmployeeController::class, 'updateBenefits'])->name('benefits');
    });

    Route::put('{employee}/compensation', [EmployeeController::class, 'updateCompensation'])->middleware('permission:employees.compensation.edit')->name('compensation');
    Route::put('{employee}/government', [EmployeeController::class, 'updateGovernment'])->middleware('permission:employees.government.edit')->name('government');
    Route::put('{employee}/bank', [EmployeeController::class, 'updateBank'])->middleware('permission:employees.bank.edit')->name('bank');
    Route::post('bulk/status', [EmployeeBulkController::class, 'status'])->middleware('permission:employees.separate')->name('bulk.status');
    Route::put('{employee}/status', [EmployeeController::class, 'updateStatus'])->middleware('permission:employees.separate')->name('status');
    Route::post('{employee}/account', [EmployeeController::class, 'createAccount'])->middleware('permission:users.manage')->name('account');
    Route::get('{employee}/documents/{document}/link', [EmployeeDocumentController::class, 'link'])->middleware('permission:employees.pay.view')->name('documents.link');
});

// The signed link handed out above; `signed` rejects an altered or expired one.
Route::get('api/employee-documents/{document}/download', [EmployeeDocumentController::class, 'download'])
    ->middleware(['permission:employees.pay.view', 'signed'])->name('api.employee-documents.download');
