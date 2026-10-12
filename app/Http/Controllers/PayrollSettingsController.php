<?php

namespace App\Http\Controllers;

use App\Enums\LateCountingPeriod;
use App\Enums\PayrollFrequency;
use App\Models\DeductionType;
use App\Models\EarningType;
use App\Models\OvertimeRate;
use App\Models\WorkSchedule;
use App\Support\ActivityLogger;
use App\Support\PayrollDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * The smaller Payroll Settings sub-tabs: Earnings, Deductions, Overtime & Holiday Rates, Payroll Rules and Work Schedules.
 * Every row is company-scoped by its model's global scope (a row from another company is a 404); the route group
 * requires `settings.payroll.edit`.
 */
class PayrollSettingsController extends Controller
{
    // ---- Earnings ------------------------------------------------------------------------------------------------

    public function earnings(Request $request): JsonResponse
    {
        PayrollDefaults::ensureEarnings($request->user()->company_id);

        return response()->json(['data' => EarningType::orderBy('category')->orderBy('name')->get()]);
    }

    public function storeEarning(Request $request): JsonResponse
    {
        $earning = EarningType::create([...$this->earningRules($request), 'company_id' => $request->user()->company_id]);
        $this->log('Added', 'Earning type', $earning->name);

        return response()->json(['data' => $earning], 201);
    }

    public function updateEarning(Request $request, EarningType $earningType): JsonResponse
    {
        $earningType->update($this->earningRules($request, $earningType));
        $this->log('Updated', 'Earning type', $earningType->name);

        return response()->json(['data' => $earningType]);
    }

    public function destroyEarning(EarningType $earningType): JsonResponse
    {
        $earningType->delete();
        $this->log('Deleted', 'Earning type', $earningType->name);

        return response()->json(null, 204);
    }

    /** @return array<string, mixed> */
    private function earningRules(Request $request, ?EarningType $current = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('earning_types', 'name')->where('company_id', $request->user()->company_id)->ignore($current?->id)],
            'category' => ['required', 'string', 'max:40'],
            'calc_type' => ['required', Rule::in(['fixed', 'variable'])],
            'taxable' => ['required', 'boolean'],
            'included_in_payroll' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    // ---- Deductions ----------------------------------------------------------------------------------------------

    public function deductions(Request $request): JsonResponse
    {
        PayrollDefaults::ensureDeductions($request->user()->company_id);

        return response()->json(['data' => DeductionType::orderBy('category')->orderBy('name')->get()]);
    }

    public function storeDeduction(Request $request): JsonResponse
    {
        $deduction = DeductionType::create([...$this->deductionRules($request), 'company_id' => $request->user()->company_id]);
        $this->log('Added', 'Deduction type', $deduction->name);

        return response()->json(['data' => $deduction], 201);
    }

    public function updateDeduction(Request $request, DeductionType $deductionType): JsonResponse
    {
        $deductionType->update($this->deductionRules($request, $deductionType));
        $this->log('Updated', 'Deduction type', $deductionType->name);

        return response()->json(['data' => $deductionType]);
    }

    public function destroyDeduction(DeductionType $deductionType): JsonResponse
    {
        $deductionType->delete();
        $this->log('Deleted', 'Deduction type', $deductionType->name);

        return response()->json(null, 204);
    }

    /** @return array<string, mixed> */
    private function deductionRules(Request $request, ?DeductionType $current = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('deduction_types', 'name')->where('company_id', $request->user()->company_id)->ignore($current?->id)],
            'category' => ['required', Rule::in(['government', 'tax', 'loan', 'other'])],
            'calc_type' => ['required', Rule::in(['fixed', 'variable'])],
            'recurrence' => ['required', Rule::in(['recurring', 'one_time'])],
            'allocation_method' => ['nullable', Rule::in(['equal_split', 'specific_cutoff', 'custom'])],
            'specific_cutoff_period' => ['nullable', 'required_if:allocation_method,specific_cutoff', 'integer', 'min:1', 'max:6'],
            'custom_split_percentages' => ['nullable', 'required_if:allocation_method,custom', 'array', 'min:2', 'max:6'],
            'custom_split_percentages.*' => ['numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        // A custom split has to account for the whole monthly amount.
        if (($data['allocation_method'] ?? null) === 'custom' && abs(array_sum($data['custom_split_percentages']) - 100) > 0.001) {
            throw ValidationException::withMessages(['custom_split_percentages' => 'The percentages must add up to 100.']);
        }

        return $data;
    }

    // ---- Overtime & holiday rates --------------------------------------------------------------------------------

    public function overtimeRates(Request $request): JsonResponse
    {
        PayrollDefaults::ensureOvertimeRates($request->user()->company_id);
        $rates = OvertimeRate::orderBy('id')->get();

        return response()->json(['data' => ['overtime' => $rates->where('group', 'overtime')->values(), 'holiday' => $rates->where('group', 'holiday')->values()]]);
    }

    /** Built-in rows keep their meaning (only the multiplier, and the label, can change); custom rows can also be removed. */
    public function updateOvertimeRate(Request $request, OvertimeRate $overtimeRate): JsonResponse
    {
        $overtimeRate->update($request->validate([
            'label' => ['sometimes', 'string', 'max:120'],
            // Decimal multiplier: 1.25 = 125%. Capped so a typo like 125 (meaning 125%) is caught.
            'multiplier' => ['required', 'numeric', 'min:0', 'max:10'],
        ]));
        $this->log('Updated', 'Overtime rate', "{$overtimeRate->label} ({$overtimeRate->multiplier})");

        return response()->json(['data' => $overtimeRate]);
    }

    public function storeOvertimeRate(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $data = $request->validate([
            'label' => ['required', 'string', 'max:120'],
            'multiplier' => ['required', 'numeric', 'min:0', 'max:10'],
        ]);
        PayrollDefaults::ensureOvertimeRates($companyId);

        $rate = OvertimeRate::create([...$data, 'company_id' => $companyId, 'key' => 'custom_'.bin2hex(random_bytes(4)), 'group' => 'overtime', 'is_custom' => true]);
        $this->log('Added', 'Overtime rate', $rate->label);

        return response()->json(['data' => $rate], 201);
    }

    public function destroyOvertimeRate(OvertimeRate $overtimeRate): JsonResponse
    {
        if (! $overtimeRate->is_custom) {
            return response()->json(['message' => 'Built-in rates cannot be deleted, only edited.'], 422);
        }
        $overtimeRate->delete();
        $this->log('Deleted', 'Overtime rate', $overtimeRate->label);

        return response()->json(null, 204);
    }

    // ---- Payroll rules -------------------------------------------------------------------------------------------

    public function rules(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->currentRules($request)]);
    }

    /** One form, saved as a block; missing keys keep their current value. */
    public function updateRules(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rounding_decimal_precision' => ['sometimes', 'integer', 'min:0', 'max:4'],
            'rounding_method' => ['sometimes', Rule::in(['nearest', 'round_up', 'round_down'])],
            'late_grace_period_minutes' => ['sometimes', 'integer', 'min:0', 'max:240'],
            'late_deduction_enabled' => ['sometimes', 'boolean'],
            'late_deduction_method' => ['sometimes', Rule::in(['per_minute', 'fixed'])],
            'late_per_minute_deduction' => ['sometimes', 'numeric', 'min:0', 'max:100000'],
            'late_counting_period' => ['sometimes', Rule::enum(LateCountingPeriod::class)],
            'late_custom_start_month' => ['sometimes', 'integer', 'between:1,12'],
            'late_custom_start_day' => ['sometimes', 'integer', 'between:1,31'], // a short month falls back to its last day
            'overtime_pre_approval_required' => ['sometimes', 'boolean'],
            'overtime_rest_day_multiplier' => ['sometimes', 'numeric', 'min:1', 'max:10'],
            'overtime_holiday_multiplier' => ['sometimes', 'numeric', 'min:1', 'max:10'],
            'absence_daily_rate_basis' => ['sometimes', Rule::in(['basic_pay_divided_by_working_days', 'fixed_daily_rate'])],
            'absence_unpaid_handling' => ['sometimes', Rule::in(['deduct_daily_rate', 'no_deduction'])],
            'proration_new_employee' => ['sometimes', 'boolean'],
            'proration_resigned_employee' => ['sometimes', 'boolean'],
            'proration_mid_period_changes' => ['sometimes', 'boolean'],
            'adjustments_retroactive_allowed' => ['sometimes', 'boolean'],
            'adjustments_manual_allowed' => ['sometimes', 'boolean'],
            'adjustments_approval_required' => ['sometimes', 'boolean'],
            'default_deduction_schedules' => ['sometimes', 'array'],
        ]);

        // The company-wide default schedule per frequency has to be one that frequency allows.
        foreach ($data['default_deduction_schedules'] ?? [] as $frequency => $schedule) {
            $allowed = PayrollFrequency::tryFrom((string) $frequency)?->deductionSchedules();
            if ($allowed === null || ! collect($allowed)->contains(fn ($s) => $s->value === $schedule)) {
                throw ValidationException::withMessages(['default_deduction_schedules' => "\"{$schedule}\" is not a valid deduction schedule for {$frequency} groups."]);
            }
        }

        $company = $request->user()->company;
        $company->payroll_rules = [...$this->currentRules($request), ...$data];
        $company->save();
        $this->log('Updated', 'Payroll rules', $company->name);

        return response()->json(['data' => $this->currentRules($request)]);
    }

    /** @return array<string, mixed> */
    private function currentRules(Request $request): array
    {
        return [...PayrollDefaults::RULES, ...($request->user()->company?->payroll_rules ?? [])];
    }

    // ---- Work schedules ------------------------------------------------------------------------------------------

    public function workSchedules(): JsonResponse
    {
        return response()->json(['data' => WorkSchedule::withCount('payrollGroups')->orderBy('name')->get()]);
    }

    public function storeWorkSchedule(Request $request): JsonResponse
    {
        $schedule = WorkSchedule::create([...$this->scheduleRules($request), 'company_id' => $request->user()->company_id]);
        $this->log('Added', 'Work schedule', $schedule->name);

        return response()->json(['data' => $schedule], 201);
    }

    public function updateWorkSchedule(Request $request, WorkSchedule $workSchedule): JsonResponse
    {
        $workSchedule->update($this->scheduleRules($request, $workSchedule));
        $this->log('Updated', 'Work schedule', $workSchedule->name);

        return response()->json(['data' => $workSchedule]);
    }

    public function destroyWorkSchedule(WorkSchedule $workSchedule): JsonResponse
    {
        $using = $workSchedule->payrollGroups()->count();
        if ($using > 0) {
            return response()->json(['message' => "This schedule is the default of {$using} payroll group".($using === 1 ? '' : 's').'. Change those groups first.'], 422);
        }
        $workSchedule->delete();
        $this->log('Deleted', 'Work schedule', $workSchedule->name);

        return response()->json(null, 204);
    }

    /** @return array<string, mixed> */
    private function scheduleRules(Request $request, ?WorkSchedule $current = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120', Rule::unique('work_schedules', 'name')->where('company_id', $request->user()->company_id)->ignore($current?->id)],
            'shift_type' => ['required', Rule::in(['day', 'night', 'split', 'flexible'])],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'], // may be earlier than the start: a night shift ends the next day
            'break_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'grace_period_minutes' => ['required', 'integer', 'min:0', 'max:120'],
            'days_of_week' => ['required', 'array', 'min:1', 'max:7'],
            'days_of_week.*' => ['integer', 'between:1,7', 'distinct'],
            'rest_days' => ['nullable', 'array', 'max:7'],
            'rest_days.*' => ['integer', 'between:1,7', 'distinct'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);
    }

    private function log(string $action, string $title, string $description): void
    {
        ActivityLogger::log(module: 'Payroll', action: $action, title: $title, description: $description);
    }
}
