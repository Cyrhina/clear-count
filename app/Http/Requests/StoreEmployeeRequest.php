<?php

namespace App\Http\Requests;

use App\Support\EmployeeRules;
use Illuminate\Foundation\Http\FormRequest;

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
        return EmployeeRules::hire($this->user());
    }
}
