<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends StoreEmployeeRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'employee_number' => [
                'required', 'string', 'max:30',
                Rule::unique('employees')->where('company_id', $this->user()->company_id)->ignore($this->route('employee')),
            ],
        ];
    }
}
