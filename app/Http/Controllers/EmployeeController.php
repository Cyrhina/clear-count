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
        ActivityLogger::log(module: 'Employees', action: 'Added', title: 'Employee', description: $employee->name, subject: $employee);

        return to_route('employees.show', ['id' => $employee->id]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $employee->update($request->validated());
        ActivityLogger::log(module: 'Employees', action: 'Updated', title: 'Employee', description: $employee->name, subject: $employee);

        return back();
    }
}
