<?php

namespace App\Http\Controllers;

use App\Http\Resources\EmployeeDetailResource;
use App\Models\Employee;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The signed-in person's own employee record, whatever their role. An account with no employee gets `data: null`. */
class MeController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $employee = $this->employee($request);

        return response()->json(['data' => $employee ? $this->present($employee, $request) : null]);
    }

    /** Only the fields an employee may change themselves; everything else on the record is HR's. */
    public function update(Request $request): JsonResponse
    {
        $employee = $this->employee($request);
        abort_unless($employee, 404);

        $data = $request->validate([
            'contact_number' => ['required', 'string', 'max:30'],
            'personal_email' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
        ]);
        $employee->update(['personal' => [...$employee->personal, 'contactNumber' => $data['contact_number'], 'personalEmail' => $data['personal_email'] ?? null, 'address' => $data['address']]]);
        ActivityLogger::log(module: 'Employees', action: 'Updated', title: 'Personal information', description: $employee->name, subject: $employee);

        return response()->json(['data' => $this->present($employee, $request)]);
    }

    /** The detail resource plus the branch name: an employee cannot read the branch list. @return array<string, mixed> */
    private function present(Employee $employee, Request $request): array
    {
        return [...(new EmployeeDetailResource($employee))->resolve($request), 'branch_name' => $employee->branch?->name];
    }

    /** Looked up by the account's link, not through the Employee scope: a manager keeps their own record even if it sits outside their branch. */
    private function employee(Request $request): ?Employee
    {
        $user = $request->user();

        return $user->employee_id ? Employee::withoutGlobalScope('company')->where('company_id', $user->company_id)->find($user->employee_id) : null;
    }
}
