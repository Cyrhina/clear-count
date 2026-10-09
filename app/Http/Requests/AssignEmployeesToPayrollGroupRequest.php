<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignEmployeesToPayrollGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.payroll.edit');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // `assign` moves the employees into this group (out of any other); `unassign` removes them from it.
            'action' => ['sometimes', Rule::in(['assign', 'unassign'])],
            'employee_ids' => ['required', 'array', 'min:1', 'max:500'],
            // Only employees of the same company can be moved.
            'employee_ids.*' => ['integer', 'distinct', Rule::exists('employees', 'id')->where('company_id', $this->user()->company_id)],
        ];
    }

    public function action(): string
    {
        return $this->input('action', 'assign');
    }
}
