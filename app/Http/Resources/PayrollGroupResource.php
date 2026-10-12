<?php

namespace App\Http\Resources;

use App\Support\PayrollCalendar;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A payroll group as the card shows it (display strings), plus the raw keys and configs the edit form needs.
 *
 * @mixin \App\Models\PayrollGroup
 */
class PayrollGroupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,

            // Display strings for the card
            'frequency' => $this->frequency->label(),
            'compensation' => $this->compensationType?->name,
            'cutoff_display' => PayrollCalendar::cutoffDisplay($this->frequency, $this->cutoff_config),
            'pay_dates_display' => PayrollCalendar::payDatesDisplay($this->pay_date_config),
            'deduction_schedule_display' => $this->deduction_schedule->label($this->frequency),
            'work_schedule_name' => $this->workSchedule?->name,
            'effective_date' => $this->effective_date->toDateString(),
            'employees_count' => $this->assignedEmployeesCount(),

            // Raw values to pre-fill the edit form
            'frequency_key' => $this->frequency->value,
            'compensation_type_id' => $this->compensation_type_id,
            'cutoff_config' => $this->cutoff_config,
            'pay_date_config' => $this->pay_date_config,
            'deduction_schedule' => $this->deduction_schedule->value,
            'work_schedule_id' => $this->work_schedule_id,

            // Only on the single-group endpoint: who is in the group.
            'employees' => $this->whenLoaded('employees', fn () => $this->employees->map(fn ($e) => [
                'id' => $e->id,
                'employee_number' => $e->employee_number,
                'name' => $e->name,
                'department' => $e->department,
                'status' => $e->status,
            ])->all()),
        ];
    }
}
