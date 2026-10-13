<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PagibigRate;
use App\Models\PhilhealthRate;
use App\Payroll\Statutory\StatutoryCalculator;
use App\Payroll\Statutory\StatutoryTables;
use App\Payroll\Tax\WithholdingTax;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** The company's SSS, PhilHealth, Pag-IBIG and withholding tax tables for a date, their edit, and a preview of what they give an employee. */
class StatutoryController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $date = $request->validate(['date' => ['nullable', 'date_format:Y-m-d']])['date'] ?? now()->toDateString();

        return response()->json(['data' => StatutoryTables::for($request->user()->company_id, $date)]);
    }

    /** Saves any of the tables from an effective date (today by default). A table left out of the request is not touched. */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'effective_from' => ['nullable', 'date_format:Y-m-d'],
            'sss_brackets' => ['sometimes', 'array', 'min:1', 'max:200'],
            'sss_brackets.*.min_salary' => ['required', 'numeric', 'min:0'],
            'sss_brackets.*.max_salary' => ['nullable', 'numeric', 'gt:sss_brackets.*.min_salary'],
            'sss_brackets.*.msc' => ['required', 'numeric', 'min:0'],
            'sss_brackets.*.employee_share' => ['required', 'numeric', 'min:0'],
            'sss_brackets.*.employer_share' => ['required', 'numeric', 'min:0'],
            'sss_brackets.*.ec' => ['required', 'numeric', 'min:0'],
            'philhealth' => ['sometimes', 'array'],
            'philhealth.rate' => ['required_with:philhealth', 'numeric', 'min:0', 'max:1'],
            'philhealth.employee_share_percent' => ['required_with:philhealth', 'numeric', 'min:0', 'max:1'],
            'philhealth.employer_share_percent' => ['required_with:philhealth', 'numeric', 'min:0', 'max:1'],
            'philhealth.salary_floor' => ['required_with:philhealth', 'numeric', 'min:0'],
            'philhealth.salary_ceiling' => ['required_with:philhealth', 'numeric', 'gte:philhealth.salary_floor'],
            'pagibig' => ['sometimes', 'array'],
            'pagibig.rate' => ['required_with:pagibig', 'numeric', 'min:0', 'max:1'],
            'pagibig.max_fund_salary' => ['required_with:pagibig', 'numeric', 'min:0'],
            'pagibig.employee_amount' => ['required_with:pagibig', 'numeric', 'min:0'],
            'pagibig.employer_amount' => ['required_with:pagibig', 'numeric', 'min:0'],
            'tax_tables' => ['sometimes', 'array'],
            'tax_tables.*' => ['array', 'min:1', 'max:50'],
            'tax_tables.*.*.min' => ['required', 'numeric', 'min:0'],
            'tax_tables.*.*.max' => ['nullable', 'numeric', 'gt:tax_tables.*.*.min'],
            'tax_tables.*.*.rate' => ['required', 'numeric', 'min:0', 'max:1'],
            'tax_tables.*.*.base_tax' => ['required', 'numeric', 'min:0'],
        ]);
        if (! isset($data['sss_brackets']) && ! isset($data['philhealth']) && ! isset($data['pagibig']) && ! isset($data['tax_tables'])) {
            throw ValidationException::withMessages(['sss_brackets' => ['Send at least one table to save.']]);
        }
        foreach (array_keys($data['tax_tables'] ?? []) as $frequency) {
            if (! in_array($frequency, WithholdingTax::FREQUENCIES, true)) {
                throw ValidationException::withMessages(['tax_tables' => ["Unknown pay period: {$frequency}."]]);
            }
        }

        $companyId = $request->user()->company_id;
        $date = $data['effective_from'] ?? now()->toDateString();
        $saved = [];

        if (isset($data['sss_brackets'])) {
            StatutoryTables::saveSss($companyId, $date, $this->ordered($data['sss_brackets'], 'min_salary', 'sss_brackets'));
            $saved[] = 'SSS';
        }
        if (isset($data['philhealth'])) {
            StatutoryTables::saveRule(PhilhealthRate::class, $companyId, $date, $data['philhealth']);
            $saved[] = 'PhilHealth';
        }
        if (isset($data['pagibig'])) {
            StatutoryTables::saveRule(PagibigRate::class, $companyId, $date, $data['pagibig']);
            $saved[] = 'Pag-IBIG';
        }
        foreach ($data['tax_tables'] ?? [] as $frequency => $rows) {
            StatutoryTables::saveTax($companyId, $date, $frequency, $this->ordered($rows, 'min', "tax_tables.{$frequency}"));
            $saved[] = "withholding tax ({$frequency})";
        }
        ActivityLogger::log(module: 'Statutory', action: 'Updated', title: 'Statutory tables', description: implode(', ', $saved)." from {$date}");

        return response()->json(['data' => StatutoryTables::for($companyId, $date)]);
    }

    /** The active employees with just what the contributions screen needs (a payroll role has no access to the employee records). */
    public function employees(): JsonResponse
    {
        $rows = Employee::where('status', 'active')->orderBy('name')->get(['id', 'employee_number', 'personal', 'employment', 'compensation', 'government'])->map(fn (Employee $e) => [
            'id' => $e->id, 'employee_number' => $e->employee_number, 'personal' => Arr::only($e->personal ?? [], ['firstName', 'lastName']),
            'employment' => Arr::only($e->employment ?? [], ['department', 'status']), 'compensation' => Arr::only($e->compensation ?? [], ['payType', 'basicPay']),
            'government' => Arr::only($e->government ?? [], ['pagibigEmployeeContribution']),
        ]);

        return response()->json(['data' => $rows]);
    }

    /** What the tables in force give for each row: the same calculation payroll runs use. */
    public function preview(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'rows' => ['required', 'array', 'min:1', 'max:500'],
            'rows.*.monthly_salary' => ['required', 'numeric', 'min:0'],
            'rows.*.frequency' => ['nullable', Rule::in(['daily', 'weekly', 'biweekly', 'semi_monthly', 'monthly', 'custom'])],
            'rows.*.periods_per_month' => ['nullable', 'numeric', 'min:0'],
            'rows.*.pagibig_voluntary' => ['nullable', 'numeric', 'min:0'],
        ]);
        $config = StatutoryTables::for($request->user()->company_id, $data['date'] ?? now()->toDateString());

        $rows = array_map(fn (array $r) => StatutoryCalculator::monthlyFor(
            $config, (float) $r['monthly_salary'], $r['frequency'] ?? null, (float) ($r['periods_per_month'] ?? 1), (float) ($r['pagibig_voluntary'] ?? 0),
        ), $data['rows']);

        return response()->json(['data' => $rows]);
    }

    /**
     * Brackets in order, the first starting at 0: a gap at the bottom would leave pay with no bracket.
     *
     * @param  list<array<string, mixed>>  $rows
     * @return list<array<string, mixed>>
     */
    private function ordered(array $rows, string $minKey, string $field): array
    {
        usort($rows, fn ($a, $b) => $a[$minKey] <=> $b[$minKey]);
        if ((float) $rows[0][$minKey] !== 0.0) {
            throw ValidationException::withMessages([$field => ['The first bracket must start at 0.']]);
        }

        return $rows;
    }
}
