<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creates a custom reminder (every field) or updates one (only the fields sent: the dashboard toggle sends just `enabled`).
 * The in-app `link` is never accepted: only the built-in deadlines carry one.
 */
class ComplianceDeadlineRequest extends FormRequest
{
    public const CATEGORIES = ['SSS', 'PhilHealth', 'Pag-IBIG', 'BIR', 'Payroll', 'Other'];

    public function authorize(): bool
    {
        return $this->user()->can('settings.payroll.edit');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name' => [$required, 'string', 'max:150'],
            'category' => [$required, Rule::in(self::CATEGORIES)],
            'description' => [$required, 'string', 'max:500'],
            'frequency' => [$required, Rule::in(['monthly', 'yearly', 'one_time'])],
            'due_day' => ['nullable', 'integer', 'between:1,31', 'required_if:frequency,monthly,yearly'],
            'due_month' => ['nullable', 'integer', 'between:0,11', 'required_if:frequency,yearly'], // 0 = January
            'due_date' => ['nullable', 'date_format:Y-m-d', 'required_if:frequency,one_time'],
            'remind_days_before' => [$required, 'integer', 'between:0,365'],
            'enabled' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Fields that do not belong to the chosen frequency are cleared, so changing a reminder's frequency leaves no stale day behind.
     *
     * @return array<string, mixed>
     */
    public function deadlineData(): array
    {
        $data = $this->validated();

        if (isset($data['frequency'])) {
            $data += ['due_day' => null, 'due_month' => null, 'due_date' => null];
            if ($data['frequency'] === 'one_time') {
                $data['due_day'] = $data['due_month'] = null;
            } else {
                $data['due_date'] = null;
                if ($data['frequency'] === 'monthly') {
                    $data['due_month'] = null;
                }
            }
        }

        return $data;
    }
}
