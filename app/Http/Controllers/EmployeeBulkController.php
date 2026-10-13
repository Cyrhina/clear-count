<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\BranchDepartment;
use App\Models\Employee;
use App\Support\ActivityLogger;
use App\Support\EmployeeHiring;
use App\Support\EmployeeRules;
use App\Support\ImportKit;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Many employees at once: the CSV import (the browser parses the file and posts the rows) and the bulk changes of the
 * Employees list. Scope comes from the model's global scope, so ids outside the company or branch are simply not touched.
 */
class EmployeeBulkController extends Controller
{
    /**
     * Validates every row of an import and, unless `dry_run` is set, adds the valid ones. A name that already exists (or
     * appears twice in the file) is an error on that row. Government IDs and bank details are dropped, with a warning, for
     * users who may not edit them.
     */
    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rows' => ['required', 'array', 'min:1', 'max:'.ImportKit::MAX_ROWS],
            'rows.*' => ['array'],
            'dry_run' => ['sometimes', 'boolean'],
        ]);
        $user = $request->user();
        $dryRun = (bool) ($data['dry_run'] ?? false);

        $taken = Employee::pluck('name')->map(fn ($n) => mb_strtolower($n))->flip()->all();
        $warnings = [];
        $rows = collect($data['rows'])->map(function (array $row, int $i) use ($user, &$warnings) {
            foreach (['government' => 'employees.government.edit', 'bank' => 'employees.bank.edit'] as $section => $capability) {
                if (! empty($row[$section]) && ! $user->can($capability)) {
                    unset($row[$section]);
                    $warnings[$i][] = ucfirst($section).' details ignored (you cannot edit them)';
                }
            }

            return $row;
        })->all();

        $result = ImportKit::run(
            $rows,
            fn () => EmployeeRules::hire($user),
            function (array $row) use (&$taken): array {
                $name = mb_strtolower(trim("{$row['personal']['firstName']} {$row['personal']['lastName']}"));
                if (isset($taken[$name])) {
                    return ['An employee with this name already exists'];
                }
                $taken[$name] = true;

                return [];
            },
            fn (array $row) => EmployeeHiring::hire($row, $user),
            $dryRun,
        );

        $result['rows'] = array_map(fn ($r, $i) => [...$r, 'warnings' => $warnings[$i] ?? []], $result['rows'], array_keys($result['rows']));
        if (! $dryRun) {
            ActivityLogger::log(module: 'Employees', action: 'Added', title: 'Employee import', description: "{$result['created']} added, {$result['skipped']} skipped");
        }

        return response()->json(['data' => $result]);
    }

    /** Moves the employees to a department of their own branch (created there if it does not exist yet). */
    public function department(Request $request): JsonResponse
    {
        $data = $request->validate([...$this->ids(), 'department' => ['required', 'string', 'max:100']]);
        $department = trim($data['department']);

        $changed = $this->each($data['ids'], function (Employee $e) use ($department) {
            if ($e->department === $department) {
                return false;
            }
            $e->update(['employment' => [...$e->employment, 'department' => $department]]);
            BranchDepartment::ensure($e->branch_id, $department);
            BranchDepartment::releaseSupervisor($e);
        });
        ActivityLogger::log(module: 'Employees', action: 'Updated', title: 'Bulk department change', description: "{$changed} employee(s) moved to {$department}");

        return response()->json(['data' => ['changed' => $changed]]);
    }

    /** Transfers the employees to a branch; their department is created there when missing and they stop supervising the old one. */
    public function branch(Request $request): JsonResponse
    {
        $data = $request->validate([...$this->ids(), 'branch_id' => ['required', Rule::exists('branches', 'id')->where('company_id', $request->user()->company_id)]]);
        $branch = Branch::findOrFail($data['branch_id']);

        $changed = $this->each($data['ids'], function (Employee $e) use ($branch) {
            if ($e->branch_id === $branch->id) {
                return false;
            }
            $e->update(['branch_id' => $branch->id]);
            BranchDepartment::ensure($branch->id, $e->department);
            BranchDepartment::releaseSupervisor($e);
        });
        ActivityLogger::log(module: 'Employees', action: 'Updated', title: 'Bulk branch transfer', description: "{$changed} employee(s) moved to {$branch->name}");

        return response()->json(['data' => ['changed' => $changed]]);
    }

    /** Active, inactive or archived for many at once. A separation (reason, last day) is recorded one employee at a time. */
    public function status(Request $request): JsonResponse
    {
        $data = $request->validate([...$this->ids(), 'status' => ['required', Rule::in(['active', 'inactive', 'archived'])]]);

        $changed = $this->each($data['ids'], function (Employee $e) use ($data) {
            if ($e->status === $data['status']) {
                return false;
            }
            // Going back to active clears an earlier separation.
            $employment = collect($e->employment)->except($data['status'] === 'active' ? ['dateSeparated', 'separationReason'] : [])->all();
            $e->update(['employment' => [...$employment, 'status' => $data['status']]]);
        });
        ActivityLogger::log(module: 'Employees', action: 'Updated', title: 'Bulk status change', description: "{$changed} employee(s) set to {$data['status']}");

        return response()->json(['data' => ['changed' => $changed]]);
    }

    /** @return array<string, array<int, mixed>> */
    private function ids(): array
    {
        return ['ids' => ['required', 'array', 'min:1', 'max:'.ImportKit::MAX_ROWS], 'ids.*' => ['integer', 'distinct']];
    }

    /**
     * Runs the change on every employee in scope and counts those it changed (the change returns false for "nothing to do").
     *
     * @param  list<int>  $ids
     */
    private function each(array $ids, Closure $change): int
    {
        return DB::transaction(fn () => Employee::whereIn('id', $ids)->get()->filter(fn (Employee $e) => $change($e) !== false)->count());
    }
}
