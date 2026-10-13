<?php

namespace App\Http\Controllers;

use App\Models\BenefitPlan;
use App\Models\Employee;
use App\Models\EmployeeBenefit;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Benefit plans (HMO, allowances, insurance, other), what each employee is enrolled in, and the bulk enrol and transfer. */
class BenefitController extends Controller
{
    private const CATEGORIES = ['hmo', 'allowance', 'insurance', 'other'];

    // ---- Plans ---------------------------------------------------------------------------------------------------

    public function plans(Request $request): JsonResponse
    {
        $category = $request->validate(['category' => ['nullable', Rule::in(self::CATEGORIES)]])['category'] ?? null;

        return response()->json(['data' => BenefitPlan::when($category, fn ($q) => $q->where('category', $category))->orderBy('name')->get()]);
    }

    public function storePlan(Request $request): JsonResponse
    {
        $data = $this->planRules($request);
        $this->assertNameFree($data['category'], $data['name']);

        $plan = BenefitPlan::create([...$data, 'company_id' => $request->user()->company_id, 'status' => 'active']);
        ActivityLogger::log(module: 'Benefits', action: 'Added', title: 'Benefit plan', description: $plan->name, subject: $plan);

        return response()->json(['data' => $plan], 201);
    }

    /** Updates the plan and carries the change to everyone still enrolled (active or paused). A custom plan's amount stays each employee's own. */
    public function updatePlan(Request $request, BenefitPlan $benefitPlan): JsonResponse
    {
        $data = $this->planRules($request, partial: true);
        if (isset($data['name'])) {
            $this->assertNameFree($benefitPlan->category, $data['name'], $benefitPlan->id);
        }
        unset($data['category']); // the category of a plan does not change

        $enrolled = DB::transaction(function () use ($benefitPlan, $data): int {
            $benefitPlan->update($data);
            $live = EmployeeBenefit::where('benefit_plan_id', $benefitPlan->id)->whereIn('status', ['active', 'paused'])->get();
            foreach ($live as $b) {
                $b->update([
                    'name' => $benefitPlan->name, 'provider' => $benefitPlan->provider, 'coverage' => $benefitPlan->coverage, 'employee_share' => $benefitPlan->employee_share,
                    ...($benefitPlan->amount_type === 'custom' ? [] : ['monthly_value' => $benefitPlan->monthly_value]),
                ]);
            }

            return $live->count();
        });
        ActivityLogger::log(module: 'Benefits', action: 'Updated', title: 'Benefit plan', description: "{$benefitPlan->name} ({$enrolled} enrolled updated)", subject: $benefitPlan);

        return response()->json(['data' => $benefitPlan, 'updated_enrollments' => $enrolled]);
    }

    public function setPlanStatus(Request $request, BenefitPlan $benefitPlan): JsonResponse
    {
        $status = $request->validate(['status' => ['required', Rule::in(['active', 'archived'])]])['status'];
        $live = EmployeeBenefit::where('benefit_plan_id', $benefitPlan->id)->whereIn('status', ['active', 'paused'])->count();
        if ($status === 'archived' && $live > 0) {
            return $this->refuse("{$benefitPlan->name} still has {$live} enrolled employee".($live === 1 ? '' : 's').'. Cancel or move them first.');
        }
        $benefitPlan->update(['status' => $status]);

        return response()->json(['data' => $benefitPlan]);
    }

    // ---- What employees have -------------------------------------------------------------------------------------

    public function index(): JsonResponse
    {
        return response()->json(['data' => EmployeeBenefit::orderByDesc('id')->get()]);
    }

    /** A benefit given to one employee outside a plan (or a custom one). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
            'category' => ['required', Rule::in(self::CATEGORIES)],
            'name' => ['required', 'string', 'max:120'],
            'provider' => ['nullable', 'string', 'max:120'],
            'coverage' => ['nullable', 'string', 'max:255'],
            'monthly_value' => ['required', 'numeric', 'min:0', 'max:10000000'],
            'employee_share' => ['nullable', 'numeric', 'min:0', 'max:10000000'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);
        $employee = Employee::findOrFail($data['employee_id']);
        $benefit = EmployeeBenefit::create([...$data, 'employee_share' => $data['employee_share'] ?? 0, 'company_id' => $employee->company_id, 'status' => 'active']);
        ActivityLogger::log(module: 'Benefits', action: 'Added', title: 'Employee benefit', description: "{$benefit->name} for {$employee->name}", subject: $benefit);

        return response()->json(['data' => $benefit], 201);
    }

    /** Edits a benefit or changes its status (pause, resume, cancel). A cancelled one is final. */
    public function update(Request $request, EmployeeBenefit $employeeBenefit): JsonResponse
    {
        if ($employeeBenefit->status === 'cancelled') {
            return $this->refuse('A cancelled benefit cannot be changed.');
        }
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'provider' => ['nullable', 'string', 'max:120'],
            'coverage' => ['nullable', 'string', 'max:255'],
            'monthly_value' => ['sometimes', 'numeric', 'min:0', 'max:10000000'],
            'employee_share' => ['sometimes', 'numeric', 'min:0', 'max:10000000'],
            'start_date' => ['sometimes', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d'],
            'status' => ['sometimes', Rule::in(['active', 'paused', 'cancelled'])],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);
        $employeeBenefit->update($data);
        ActivityLogger::log(module: 'Benefits', action: 'Updated', title: 'Employee benefit', description: $employeeBenefit->name, subject: $employeeBenefit);

        return response()->json(['data' => $employeeBenefit]);
    }

    // ---- Bulk ----------------------------------------------------------------------------------------------------

    /** Enrols employees in a plan. Skips anyone already in it and, for HMO, anyone already in another HMO plan. */
    public function enroll(Request $request, BenefitPlan $benefitPlan): JsonResponse
    {
        $data = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'amounts' => ['nullable', 'array'],
            'amounts.*' => ['numeric', 'min:0', 'max:10000000'],
        ]);
        if ($benefitPlan->status !== 'active') {
            return response()->json(['data' => ['added' => 0, 'skipped' => count($data['employee_ids'])]]);
        }

        $allowed = Employee::whereIn('id', $data['employee_ids'])->where('status', 'active')->pluck('company_id', 'id');
        $added = 0;
        $skipped = 0;
        foreach (array_unique($data['employee_ids']) as $employeeId) {
            $already = EmployeeBenefit::where('employee_id', $employeeId)->where('category', $benefitPlan->category)->where('status', '!=', 'cancelled')->whereNotNull('benefit_plan_id')
                ->when($benefitPlan->category !== 'hmo', fn ($q) => $q->where('benefit_plan_id', $benefitPlan->id))->exists();
            if (! isset($allowed[$employeeId]) || $already) {
                $skipped++;

                continue;
            }
            EmployeeBenefit::create([
                'company_id' => $allowed[$employeeId], 'employee_id' => $employeeId, 'benefit_plan_id' => $benefitPlan->id, 'category' => $benefitPlan->category, 'name' => $benefitPlan->name,
                'provider' => $benefitPlan->provider, 'coverage' => $benefitPlan->coverage, 'employee_share' => $benefitPlan->employee_share, 'start_date' => $data['start_date'],
                'monthly_value' => $benefitPlan->amount_type === 'custom' ? ($data['amounts'][$employeeId] ?? $benefitPlan->monthly_value) : $benefitPlan->monthly_value,
            ]);
            $added++;
        }
        ActivityLogger::log(module: 'Benefits', action: 'Enrolled', title: 'Benefit plan', description: "{$benefitPlan->name}: {$added} employee(s) added", subject: $benefitPlan);

        return response()->json(['data' => ['added' => $added, 'skipped' => $skipped]]);
    }

    /**
     * Moves employees from one plan to another of the same category. Each old enrolment ends the day before the effective date (kept as history)
     * and a new one starts on it, so payroll never pays two plans for one day.
     */
    public function transfer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from_plan_id' => ['required', 'integer'],
            'to_plan_id' => ['required', 'integer', 'different:from_plan_id'],
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            'employee_ids.*' => ['integer'],
            'effective_date' => ['required', 'date_format:Y-m-d'],
        ]);
        $from = BenefitPlan::findOrFail($data['from_plan_id']);
        $to = BenefitPlan::findOrFail($data['to_plan_id']);
        if ($to->status !== 'active' || $from->category !== $to->category) {
            return response()->json(['data' => ['moved' => 0, 'skipped' => count($data['employee_ids'])]]);
        }

        $moved = 0;
        $skipped = 0;
        DB::transaction(function () use ($data, $from, $to, &$moved, &$skipped): void {
            foreach (array_unique($data['employee_ids']) as $employeeId) {
                $current = EmployeeBenefit::where('employee_id', $employeeId)->where('benefit_plan_id', $from->id)->where('status', '!=', 'cancelled')->first();
                $inTarget = EmployeeBenefit::where('employee_id', $employeeId)->where('benefit_plan_id', $to->id)->where('status', '!=', 'cancelled')->exists();
                if (! $current || $inTarget) {
                    $skipped++;

                    continue;
                }
                $current->update([
                    'status' => 'cancelled', 'end_date' => $data['effective_date'] > $current->start_date->toDateString() ? date('Y-m-d', strtotime($data['effective_date'].' -1 day')) : $current->start_date->toDateString(),
                    'notes' => trim(($current->notes ? $current->notes.' ' : '')."Transferred to {$to->name} on {$data['effective_date']}."),
                ]);
                EmployeeBenefit::create([
                    'company_id' => $current->company_id, 'employee_id' => $employeeId, 'benefit_plan_id' => $to->id, 'category' => $to->category, 'name' => $to->name, 'provider' => $to->provider,
                    'coverage' => $to->coverage, 'employee_share' => $to->employee_share, 'start_date' => $data['effective_date'], 'notes' => "Transferred from {$from->name}.",
                    // Moving to a custom plan keeps the employee's own amount.
                    'monthly_value' => $to->amount_type === 'custom' ? $current->monthly_value : $to->monthly_value,
                ]);
                $moved++;
            }
        });
        ActivityLogger::log(module: 'Benefits', action: 'Transferred', title: 'Benefit plan', description: "{$from->name} to {$to->name}: {$moved} employee(s)");

        return response()->json(['data' => ['moved' => $moved, 'skipped' => $skipped]]);
    }

    // ---- Helpers -------------------------------------------------------------------------------------------------

    /** @return array<string, mixed> */
    private function planRules(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'category' => [$required, Rule::in(self::CATEGORIES)],
            'name' => [$required, 'string', 'max:120'],
            'provider' => ['nullable', 'string', 'max:120'],
            'coverage' => ['nullable', 'string', 'max:255'],
            'monthly_value' => [$required, 'numeric', 'min:0', 'max:10000000'],
            'amount_type' => ['sometimes', Rule::in(['fixed', 'custom'])],
            'employee_share' => [$required, 'numeric', 'min:0', 'max:10000000'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function assertNameFree(string $category, string $name, ?int $exceptId = null): void
    {
        $taken = BenefitPlan::where('category', $category)->whereRaw('lower(name) = ?', [mb_strtolower(trim($name))])->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))->exists();
        abort_if($taken, 422, "{$name} already exists.");
    }

    private function refuse(string $message): JsonResponse
    {
        return response()->json(['message' => $message], 422);
    }
}
