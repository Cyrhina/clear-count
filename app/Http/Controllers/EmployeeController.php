<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;

/**
 * Write endpoints only; the employees pages are served by OpsController.
 */
class EmployeeController extends Controller
{
    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $employee = Employee::create($request->validated());
        ActivityLogger::log('Employee created', $employee->name);

        return to_route('employees.show', ['id' => $employee->id]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $employee->update($request->validated());
        ActivityLogger::log('Employee updated', $employee->name);

        return back();
    }
}
