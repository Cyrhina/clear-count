<?php

namespace App\Http\Requests;

use App\Support\EmployeeRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Hires an employee: the personal and job details, the starting pay, and optionally the government IDs, bank account and
 * benefits. The employee number is handed out by the server. Government IDs and bank details are only taken from users
 * who may edit them (a user without that right simply cannot set them here).
 */
class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('employees.edit');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $companyId = $this->user()->company_id;
        $user = $this->user();

        return [
            'branch_id' => ['required', Rule::exists('branches', 'id')->where('company_id', $companyId)],
            'payroll_group_id' => ['nullable', Rule::exists('payroll_groups', 'id')->where('company_id', $companyId)],
            ...EmployeeRules::personal(),
            ...EmployeeRules::employment(),
            'employment.status' => ['sometimes', Rule::in(['active', 'inactive', 'archived'])],
            ...EmployeeRules::compensation(),
            ...EmployeeRules::benefits(),
            ...($user->can('employees.government.edit') ? EmployeeRules::government() : []),
            ...($user->can('employees.bank.edit') ? EmployeeRules::bank() : []),
        ];
    }
}
