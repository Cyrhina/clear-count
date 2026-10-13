<?php

namespace App\Http\Controllers;

use App\Actions\EndEmployeeBenefits;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Resources\EmployeeDetailResource;
use App\Http\Resources\EmployeeResource;
use App\Models\BranchDepartment;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\User;
use App\Support\ActivityLogger;
use App\Support\EmployeeHiring;
use App\Support\EmployeeRules;
use App\Support\LeaveLedger;
use App\Support\ListQuery;
use App\Support\Roles;
use App\Support\UserInvites;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * The employee record. Company and branch scope come from the model's global scope (a manager only sees their branch, an
 * employee only themselves). Each section of the record is updated by its own endpoint, behind its own capability (see
 * routes/ops/employees.php), so the finer `employees.*.edit` rights are enforced on the server.
 */
class EmployeeController extends Controller
{
    private const SORTABLE = ['name', 'employee_number', 'department', 'status', 'created_at'];

    public function index(Request $request): JsonResponse
    {
        $query = ListQuery::from($request, self::SORTABLE, 'name');
        $filters = $request->validate([
            'branch_id' => ['nullable', 'integer'],
            'department' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
            'payroll_group_id' => ['nullable', 'integer'],
        ]);

        $employees = Employee::query()
            ->when($filters['branch_id'] ?? null, fn ($q, $v) => $q->where('branch_id', $v))
            ->when($filters['department'] ?? null, fn ($q, $v) => $q->where('department', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['payroll_group_id'] ?? null, fn ($q, $v) => $q->where('payroll_group_id', $v));

        foreach ($query->likeWords() as $like) {
            $employees->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('employee_number', 'like', $like)->orWhere('department', 'like', $like));
        }

        $page = $query->paginate($employees);
        Employee::preloadLeaveCredits($page->getCollection());

        return EmployeeResource::collection($page)->response();
    }

    public function show(Employee $employee): JsonResponse
    {
        return (new EmployeeDetailResource($employee))->response();
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = EmployeeHiring::hire($request->validated(), $request->user());
        ActivityLogger::log(module: 'Employees', action: 'Added', title: 'Employee', description: $employee->name, subject: $employee);

        return (new EmployeeDetailResource($employee))->response()->setStatusCode(201);
    }

    public function updatePersonal(Request $request, Employee $employee): JsonResponse
    {
        $employee->update(['personal' => $request->validate(EmployeeRules::personal())['personal']]);

        return $this->updated($employee, 'Personal information');
    }

    /** Job details, plus the branch and payroll group when sent. Keeps the status and separation fields. */
    public function updateEmployment(Request $request, Employee $employee): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $data = $request->validate([
            ...EmployeeRules::employment(),
            'branch_id' => ['sometimes', Rule::exists('branches', 'id')->where('company_id', $companyId)],
            'payroll_group_id' => ['sometimes', 'nullable', Rule::exists('payroll_groups', 'id')->where('company_id', $companyId)],
        ]);

        $employee->fill([
            'employment' => [...$employee->employment, ...$data['employment']],
            ...collect($data)->only(['branch_id', 'payroll_group_id'])->all(),
        ])->save();
        // An employee is always in a department of their branch, and stops supervising a department they have left.
        BranchDepartment::ensure($employee->branch_id, $employee->department);
        BranchDepartment::releaseSupervisor($employee);

        return $this->updated($employee, 'Employment information');
    }

    public function updateBenefits(Request $request, Employee $employee): JsonResponse
    {
        $benefits = $request->validate(EmployeeRules::benefits())['benefits'];
        // Leave credits live in the ledger: an edited amount becomes an adjustment entry, and is not stored on the record.
        foreach ($benefits['leaveCreditsByType'] ?? [] as $name => $credits) {
            if ($type = LeaveType::where('name', $name)->first()) {
                LeaveLedger::setBalance($employee, $type, (float) $credits, $request->user(), 'Edited on the employee record');
            }
        }
        $employee->update(['benefits' => Arr::except($benefits, ['leaveCreditsByType'])]);
        $employee->leaveCredits = null;

        return $this->updated($employee, 'Benefits');
    }

    /**
     * A pay change: writes a new compensation-history row (effective today unless `effective_from` says otherwise, never in
     * the future) and refreshes the employee's current pay from the row in force today. Nothing changed means nothing written.
     */
    public function updateCompensation(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            ...EmployeeRules::compensation(),
            'reason' => ['required', 'string', 'max:100'],
            'effective_from' => ['nullable', 'date', 'before_or_equal:today'],
        ]);
        $c = $data['compensation'];
        if (! array_key_exists('mixed', $c)) {
            $c['mixed'] = $employee->compensation['mixed'] ?? null;
        }
        $new = EmployeeHiring::snapshot($c);

        if ($new == $employee->compensation) {
            return (new EmployeeDetailResource($employee))->response();
        }

        DB::transaction(function () use ($employee, $new, $data, $request) {
            EmployeeHiring::recordCompensation($employee, $new, $data['reason'], $data['effective_from'] ?? now()->toDateString(), $request->user());
            $current = $employee->compensations()->effectiveOn(now()->toDateString())->first();
            $employee->update(['compensation' => EmployeeHiring::snapshot([
                'basicPay' => $current->basic_rate, 'payType' => $current->rate_type, 'outputUnit' => $current->output_unit, 'allowances' => $current->allowances, 'mixed' => $current->mixed,
            ])]);
        });

        return $this->updated($employee, 'Compensation');
    }

    public function updateGovernment(Request $request, Employee $employee): JsonResponse
    {
        $employee->update(['government' => $request->validate(EmployeeRules::government())['government']]);

        return $this->updated($employee, 'Government information');
    }

    public function updateBank(Request $request, Employee $employee): JsonResponse
    {
        $employee->update(['bank' => $request->validate(EmployeeRules::bank())['bank']]);

        return $this->updated($employee, 'Bank information');
    }

    /**
     * Active, inactive or archived. A separation (reason, last day) can only come with a non-active status; going back to
     * active clears it. A separation also ends the employee's benefits and recurring deductions on the last day.
     */
    public function updateStatus(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive', 'archived'])],
            'separation' => ['nullable', 'array', 'prohibited_if:status,active'],
            'separation.reason' => ['required_with:separation', Rule::in(['resigned', 'terminated', 'end_of_contract', 'retired'])],
            'separation.date' => ['required_with:separation', 'date'],
            'separation.notes' => ['nullable', 'string', 'max:500'],
        ]);

        $employment = collect($employee->employment)->except(['dateSeparated', 'separationReason'])->all();
        $employment['status'] = $data['status'];
        $separation = $data['separation'] ?? null;
        if ($separation) {
            $employment['dateSeparated'] = $separation['date'];
            $employment['separationReason'] = $separation['reason'];
        }
        $employee->update(['employment' => $employment]);
        if ($separation) {
            EndEmployeeBenefits::run($employee, $separation['date']);
        }

        ActivityLogger::log(
            module: 'Employees',
            action: $separation ? 'Recorded' : 'Updated',
            title: $separation ? 'Separation' : 'Status',
            description: $separation ? str_replace('_', ' ', $separation['reason'])." — last day {$separation['date']}".(($separation['notes'] ?? null) ? " ({$separation['notes']})" : '') : "Changed to {$data['status']}",
            subject: $employee,
        );

        return (new EmployeeDetailResource($employee))->response();
    }

    /** Gives an employee a login: creates the account linked to the record and emails the invite link. */
    public function createAccount(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')],
            'role' => ['nullable', Rule::in(array_diff(Roles::names(), [Roles::SUPER_ADMIN]))],
        ]);
        if (User::where('employee_id', $employee->id)->exists()) {
            return response()->json(['message' => 'This employee already has an account.'], 422);
        }

        $user = UserInvites::create([
            'first_name' => $employee->personal['firstName'],
            'last_name' => $employee->personal['lastName'],
            'email' => $data['email'],
            'company_id' => $employee->company_id,
            'branch_id' => $employee->branch_id,
            'employee_id' => $employee->id,
            'is_active' => true,
        ], $data['role'] ?? 'employee');
        ActivityLogger::log(module: 'Employees', action: 'Invited', title: 'Employee account', description: $user->email, subject: $employee);

        return response()->json(['data' => ['id' => $user->id, 'email' => $user->email]], 201);
    }

    private function updated(Employee $employee, string $section): JsonResponse
    {
        ActivityLogger::log(module: 'Employees', action: 'Updated', title: $section, description: $employee->name, subject: $employee);

        return (new EmployeeDetailResource($employee))->response();
    }
}
