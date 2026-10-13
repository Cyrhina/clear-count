<?php

namespace App\Http\Controllers;

use App\Http\Resources\BranchDepartmentResource;
use App\Models\Branch;
use App\Models\BranchDepartment;
use App\Models\Employee;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Departments of each branch. Company-scoped by the models' global scope; the route group requires `branches.manage`.
 * Employees keep their department as a name, so a rename also renames it on the employees (see BranchDepartment).
 */
class BranchDepartmentController extends Controller
{
    /** @return array<int, mixed> */
    private function nameRules(int $branchId, ?int $ignore = null): array
    {
        return ['required', 'string', 'max:120', Rule::unique('branch_departments', 'name')->where('branch_id', $branchId)->ignore($ignore)];
    }

    public function index(Request $request): JsonResponse
    {
        $branchId = $request->validate(['branch_id' => ['nullable', 'integer']])['branch_id'] ?? null;
        $departments = BranchDepartment::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->orderBy('name')->get();

        return BranchDepartmentResource::collection($departments)->response();
    }

    public function store(Request $request): JsonResponse
    {
        $branch = Branch::findOrFail($request->validate(['branch_id' => ['required', 'integer']])['branch_id']);
        $data = $request->validate(['name' => $this->nameRules($branch->id)]);
        $department = $branch->departments()->create([...$data, 'company_id' => $request->user()->company_id]);
        ActivityLogger::log(module: 'Branches', action: 'Added', title: 'Department', description: "{$department->name} ({$branch->name})", subject: $department);

        return (new BranchDepartmentResource($department))->response()->setStatusCode(201);
    }

    /** Adds the departments of one branch that another branch does not have yet. Supervisors are not copied. */
    public function copy(Request $request): JsonResponse
    {
        $data = $request->validate(['from_branch_id' => ['required', 'integer', 'different:to_branch_id'], 'to_branch_id' => ['required', 'integer']]);
        $from = Branch::findOrFail($data['from_branch_id']);
        $to = Branch::findOrFail($data['to_branch_id']);

        $have = $to->departments()->pluck('name')->map(fn ($n) => mb_strtolower($n))->all();
        $added = $from->departments()->get()->reject(fn ($d) => in_array(mb_strtolower($d->name), $have, true))
            ->each(fn ($d) => $to->departments()->create(['company_id' => $to->company_id, 'name' => $d->name]));
        ActivityLogger::log(module: 'Branches', action: 'Added', title: 'Departments', description: "{$added->count()} copied from {$from->name} to {$to->name}");

        return response()->json(['meta' => ['added' => $added->count()]]);
    }

    public function update(Request $request, BranchDepartment $department): JsonResponse
    {
        $data = $request->validate(['name' => $this->nameRules($department->branch_id, $department->id)]);

        DB::transaction(function () use ($department, $data) {
            $department->employees()->get()->each(fn (Employee $e) => $e->update(['employment' => [...$e->employment, 'department' => $data['name']]]));
            $department->update($data);
        });
        ActivityLogger::log(module: 'Branches', action: 'Updated', title: 'Department', description: $department->name, subject: $department);

        return (new BranchDepartmentResource($department))->response();
    }

    public function destroy(BranchDepartment $department): JsonResponse
    {
        $count = $department->employees()->count();
        if ($count > 0) {
            return response()->json(['message' => "{$department->name} still has {$count} employee".($count === 1 ? '' : 's').'. Move them to another department or branch first.'], 422);
        }

        $department->delete();
        ActivityLogger::log(module: 'Branches', action: 'Deleted', title: 'Department', description: $department->name, subject: $department);

        return response()->json(null, 204);
    }

    /** Only an employee of this department, in this branch, can supervise it. */
    public function setSupervisor(Request $request, BranchDepartment $department): JsonResponse
    {
        $id = $request->validate(['employee_id' => ['nullable', 'integer']])['employee_id'] ?? null;
        if ($id && ! $department->employees()->whereKey($id)->exists()) {
            $message = 'The supervisor must be an employee of this department in this branch.';

            return response()->json(['message' => $message, 'errors' => ['employee_id' => [$message]]], 422);
        }

        $department->update(['supervisor_employee_id' => $id]);
        ActivityLogger::log(module: 'Branches', action: 'Updated', title: 'Department supervisor', description: $department->name, subject: $department);

        return (new BranchDepartmentResource($department))->response();
    }
}
