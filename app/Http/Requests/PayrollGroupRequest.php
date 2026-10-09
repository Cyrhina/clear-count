<?php

namespace App\Http\Requests;

use App\Enums\CompensationType;
use App\Enums\DeductionScheduleType;
use App\Enums\PayDateType;
use App\Enums\PayrollFrequency;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Shared rules for creating and updating a payroll group. The config objects are checked against the chosen frequency. */
abstract class PayrollGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.payroll.edit');
    }

    /** The group being updated, if any (route model binding), so its own name is not a duplicate. */
    abstract protected function ignoredGroupId(): ?int;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('payroll_groups', 'name')->where('company_id', $companyId)->ignore($this->ignoredGroupId())],
            'description' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'frequency' => ['required', Rule::enum(PayrollFrequency::class)],
            'compensation_type' => ['required', Rule::enum(CompensationType::class)],
            // validated() keeps only keys that have a rule, so every key of the two configs is listed here;
            // after() then checks which ones this frequency needs.
            'cutoff_config' => ['required', 'array'],
            'cutoff_config.periods' => ['sometimes', 'array', 'max:2'],
            'cutoff_config.periods.*.start_day' => ['required', 'integer', 'min:1', 'max:31'],
            'cutoff_config.periods.*.end_day' => ['required', 'regex:/^(end|\d{1,2})$/'],
            'cutoff_config.start_day' => ['sometimes', 'integer', 'min:1', 'max:31'],
            'cutoff_config.start_weekday' => ['sometimes', 'integer', 'min:1', 'max:7'],
            'cutoff_config.anchor_date' => ['sometimes', 'date'],
            'pay_date_config' => ['required', 'array'],
            'pay_date_config.type' => ['required', Rule::enum(PayDateType::class)],
            'pay_date_config.days' => ['sometimes', 'array', 'max:2'],
            'pay_date_config.days.*' => ['integer', 'min:1', 'max:31'],
            'pay_date_config.weekday' => ['sometimes', 'integer', 'min:1', 'max:7'],
            'pay_date_config.weeks_after' => ['sometimes', 'integer', 'min:1', 'max:4'],
            'pay_date_config.weekend_rule' => ['nullable', Rule::in(['previous', 'next', 'none'])],
            'deduction_schedule' => ['required', Rule::enum(DeductionScheduleType::class)],
            'work_schedule_id' => ['nullable', Rule::exists('work_schedules', 'id')->where('company_id', $companyId)],
            'effective_date' => ['required', 'date'],
        ];
    }

    /** @return array<int, \Closure(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $frequency = PayrollFrequency::tryFrom((string) $this->input('frequency'));
            if (! $frequency || $validator->errors()->hasAny(['frequency', 'cutoff_config', 'pay_date_config'])) {
                return;
            }

            foreach ($this->cutoffErrors($frequency, $this->input('cutoff_config', [])) as $message) {
                $validator->errors()->add('cutoff_config', $message);
            }
            foreach ($this->payDateErrors($frequency, $this->input('pay_date_config', [])) as $message) {
                $validator->errors()->add('pay_date_config', $message);
            }

            $schedule = DeductionScheduleType::tryFrom((string) $this->input('deduction_schedule'));
            if ($schedule && ! in_array($schedule, $frequency->deductionSchedules(), true)) {
                $validator->errors()->add('deduction_schedule', "That deduction schedule does not apply to {$frequency->label()} groups.");
            }
        }];
    }

    /** @param array<string, mixed> $c @return list<string> */
    private function cutoffErrors(PayrollFrequency $frequency, array $c): array
    {
        $isInt = fn (mixed $v, int $min, int $max) => is_numeric($v) && (int) $v == $v && $v >= $min && $v <= $max;

        switch ($frequency) {
            case PayrollFrequency::SemiMonthly:
                $p = $c['periods'] ?? null;
                if (! is_array($p) || count($p) !== 2) {
                    return ['A semi-monthly cutoff needs exactly two periods.'];
                }
                [$one, $two] = array_values($p);
                if (! $isInt($one['start_day'] ?? null, 1, 1) || ! $isInt($one['end_day'] ?? null, 1, 27)) {
                    return ['Period 1 must start on the 1st and end between the 1st and the 27th.'];
                }
                if (! $isInt($two['start_day'] ?? null, 2, 28) || (int) $two['start_day'] !== (int) $one['end_day'] + 1 || ($two['end_day'] ?? null) !== 'end') {
                    return ['Period 2 must start the day after Period 1 ends and run to the end of the month.'];
                }

                return [];
            case PayrollFrequency::Monthly:
                return $isInt($c['start_day'] ?? null, 1, 28) ? [] : ['The monthly cutoff must start on a day from 1 to 28.'];
            case PayrollFrequency::Weekly:
                return $isInt($c['start_weekday'] ?? null, 1, 7) ? [] : ['Choose the weekday the pay week starts on.'];
            case PayrollFrequency::BiWeekly:
                if (! $isInt($c['start_weekday'] ?? null, 1, 7)) {
                    return ['Choose the weekday the pay period starts on.'];
                }
                $anchor = rescue(fn () => CarbonImmutable::parse((string) ($c['anchor_date'] ?? '')), null, false);

                return $anchor && $anchor->dayOfWeekIso === (int) $c['start_weekday']
                    ? []
                    : ['The bi-weekly anchor date must be a real date falling on the chosen start weekday.'];
        }
    }

    /** @param array<string, mixed> $c @return list<string> */
    private function payDateErrors(PayrollFrequency $frequency, array $c): array
    {
        $type = PayDateType::tryFrom((string) ($c['type'] ?? ''));
        $periodic = in_array($frequency, [PayrollFrequency::SemiMonthly, PayrollFrequency::Monthly], true);

        return match ($type) {
            PayDateType::FixedDays => ! $periodic
                ? ['Fixed pay days are only for monthly and semi-monthly groups.']
                : (($days = $c['days'] ?? null) && is_array($days) && count($days) === ($frequency === PayrollFrequency::Monthly ? 1 : 2)
                    && collect($days)->every(fn ($d) => is_numeric($d) && (int) $d == $d && $d >= 1 && $d <= 31)
                    ? []
                    : ['Give '.($frequency === PayrollFrequency::Monthly ? 'one pay day' : 'two pay days').', each from 1 to 31.']),
            PayDateType::LastWorkingDay => $frequency === PayrollFrequency::Monthly ? [] : ['"Last working day" is only for monthly groups.'],
            PayDateType::WeekdayAfterCutoff => $periodic
                ? ['"Weekday after cutoff" is only for weekly and bi-weekly groups.']
                : ((int) ($c['weekday'] ?? 0) >= 1 && (int) $c['weekday'] <= 7 && (int) ($c['weeks_after'] ?? 1) >= 1 && (int) ($c['weeks_after'] ?? 1) <= 4
                    ? []
                    : ['Choose the pay weekday and how many weeks after the cutoff (1 to 4).']),
            default => [],
        };
    }
}
