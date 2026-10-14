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
    /** Pay and bank are for people with `employees.pay.view`, and for the employee whose record it is. */
    public static function seesPay(Request $request, int $employeeId): bool
    {
        return $request->user()->can('employees.pay.view') || $request->user()->employee_id === $employeeId;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $canSeePay = self::seesPay($request, $this->id);

        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'branch_id' => $this->branch_id,
            'payroll_group_id' => $this->payroll_group_id,
            'work_schedule_id' => $this->work_schedule_id,
            'employee_number' => $this->employee_number,
            'personal' => $this->personal,
            'employment' => $this->employment,
            'benefits' => [...($this->benefits ?? []), 'leaveCreditsByType' => $this->leaveCreditsByType()],
            'government' => $this->government,
            $this->mergeWhen($canSeePay, [
                'compensation' => $this->compensation,
                'bank' => $this->bank,
            ]),
        ];
    }
}
