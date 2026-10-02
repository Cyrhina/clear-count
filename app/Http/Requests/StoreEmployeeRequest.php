<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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

        return [
            'branch_id' => ['required', Rule::exists('branches', 'id')->where('company_id', $companyId)],
            'employee_number' => ['required', 'string', 'max:30', Rule::unique('employees')->where('company_id', $companyId)],
            'personal.firstName' => ['required', 'string', 'max:100'],
            'personal.lastName' => ['required', 'string', 'max:100'],
            'personal.birthDate' => ['required', 'date'],
            'personal.civilStatus' => ['required', Rule::in(['single', 'married', 'widowed', 'separated'])],
            'personal.address' => ['required', 'string', 'max:255'],
            'personal.contactNumber' => ['required', 'string', 'max:30'],
            'personal.personalEmail' => ['nullable', 'email'],
            'employment.position' => ['required', 'string', 'max:100'],
            'employment.department' => ['required', 'string', 'max:100'],
            'employment.employmentType' => ['required', Rule::in(['regular', 'probationary', 'contractual', 'part_time'])],
            'employment.dateHired' => ['required', 'date'],
            'employment.status' => ['required', Rule::in(['active', 'inactive', 'archived'])],
            'employment.category' => ['required', 'string', 'max:50'],
            'compensation.basicPay' => ['required', 'numeric', 'min:0'],
            'compensation.payType' => ['required', Rule::in(['monthly', 'semi_monthly', 'daily', 'hourly', 'output_based'])],
            'compensation.allowances' => ['array'],
            'benefits' => ['nullable', 'array'],
            'government' => ['nullable', 'array'],
            'bank' => ['nullable', 'array'],
        ];
    }
}
