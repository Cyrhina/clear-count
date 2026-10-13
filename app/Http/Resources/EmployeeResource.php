<?php

namespace App\Http\Resources;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An employee as the list shows it. The sections keep the camelCase of the stored JSON. Pay fields (compensation, bank)
 * are left out unless the signed-in user has `employees.pay.view`.
 *
 * @mixin Employee
 */
class EmployeeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $canSeePay = $request->user()->can('employees.pay.view');

        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'branch_id' => $this->branch_id,
            'payroll_group_id' => $this->payroll_group_id,
            'employee_number' => $this->employee_number,
            'personal' => $this->personal,
            'employment' => $this->employment,
            'benefits' => $this->benefits,
            'government' => $this->government,
            $this->mergeWhen($canSeePay, [
                'compensation' => $this->compensation,
                'bank' => $this->bank,
            ]),
        ];
    }
}
