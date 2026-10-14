<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PayrollLine;
use App\Models\PayrollPeriod;
use App\Payroll\PayrollRun;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

/** Payroll runs: the periods, their lines, and the steps from draft to finalized (App\Payroll\PayrollRun). */
class PayrollController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => PayrollPeriod::orderByDesc('start_date')->orderByDesc('id')->get()]);
    }

    /** Who the runs are about: the payroll role cannot open the employee records, so this carries what the run screens read (name, job, pay rate). */
    public function employees(): JsonResponse
    {
        $rows = Employee::orderBy('name')->get()->map(fn (Employee $e) => [
            'id' => $e->id, 'employee_number' => $e->employee_number, 'branch_id' => $e->branch_id, 'payroll_group_id' => $e->payroll_group_id,
            'personal' => Arr::only($e->personal ?? [], ['firstName', 'lastName']), 'employment' => $e->employment ?? [], 'compensation' => $e->compensation ?? [],
            'government' => Arr::only($e->government ?? [], ['pagibigEmployeeContribution']),
        ]);

        return response()->json(['data' => $rows]);
    }

    public function nextNumber(Request $request): JsonResponse
    {
        $payDate = $request->validate(['pay_date' => ['required', 'date_format:Y-m-d']])['pay_date'];

        return response()->json(['data' => ['payroll_number' => PayrollRun::nextNumber($request->user()->company_id, $payDate)]]);
    }

    public function store(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $data = $request->validate([
            'label' => ['required', 'string', 'max:120'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'pay_date' => ['required', 'date_format:Y-m-d'],
            'payroll_group_id' => ['nullable', 'integer', Rule::exists('payroll_groups', 'id')->where('company_id', $companyId)],
        ]);

        $period = PayrollRun::create($companyId, $data);
        ActivityLogger::log(module: 'Payroll', action: 'Created', title: 'Payroll run', description: "{$period->payroll_number} · {$period->label}", subject: $period);

        return response()->json(['data' => $period], 201);
    }

    public function lines(PayrollPeriod $period): JsonResponse
    {
        return response()->json(['data' => $period->lines()->orderBy('id')->get()->map->toLine()]);
    }

    public function line(PayrollLine $line): JsonResponse
    {
        return response()->json(['data' => $line->toLine()]);
    }

    public function run(PayrollPeriod $period): JsonResponse
    {
        $period = PayrollRun::run($period);
        ActivityLogger::log(module: 'Payroll', action: 'Calculated', title: 'Payroll run', description: "{$period->payroll_number} · {$period->label}", subject: $period);

        return response()->json(['data' => $period]);
    }

    public function hold(Request $request, PayrollPeriod $period): JsonResponse
    {
        $count = PayrollRun::hold($period, $this->employeeIds($request));
        ActivityLogger::log(module: 'Payroll', action: 'Held', title: 'Payroll run', description: "{$count} employee(s) held out of {$period->payroll_number}", subject: $period);

        return response()->json(['data' => ['count' => $count]]);
    }

    public function release(Request $request, PayrollPeriod $period): JsonResponse
    {
        $count = PayrollRun::release($period, $this->employeeIds($request));
        ActivityLogger::log(module: 'Payroll', action: 'Released', title: 'Payroll run', description: "{$count} employee(s) put back into {$period->payroll_number}", subject: $period);

        return response()->json(['data' => ['count' => $count]]);
    }

    public function approve(Request $request, PayrollPeriod $period): JsonResponse
    {
        $period = PayrollRun::approve($period, $request->user());
        ActivityLogger::log(module: 'Payroll', action: 'Approved', title: 'Payroll run', description: "{$period->payroll_number} · {$period->label}", subject: $period);

        return response()->json(['data' => $period]);
    }

    public function finalize(Request $request, PayrollPeriod $period): JsonResponse
    {
        $period = PayrollRun::finalize($period, $request->user());
        ActivityLogger::log(module: 'Payroll', action: 'Finalized', title: 'Payroll run', description: "{$period->payroll_number} · {$period->label}", subject: $period);

        return response()->json(['data' => $period]);
    }

    /** @return list<int> */
    private function employeeIds(Request $request): array
    {
        return array_map('intval', $request->validate(['employee_ids' => ['required', 'array', 'min:1'], 'employee_ids.*' => ['integer']])['employee_ids']);
    }
}
