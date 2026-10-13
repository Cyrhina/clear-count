<?php

namespace App\Support;

use App\Models\BranchDepartment;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

/** Creating an employee and writing pay changes: shared by the hire endpoint, the import and the compensation update. */
final class EmployeeHiring
{
    /**
     * Creates the record with the next employee number, its first pay-history row and its department. Call it for a row that
     * already passed EmployeeRules; government and bank details are the caller's to filter by capability.
     *
     * @param  array<string, mixed>  $data  branch_id, payroll_group_id, personal, employment, compensation, benefits, government, bank
     */
    public static function hire(array $data, User $by): Employee
    {
        return DB::transaction(function () use ($data, $by) {
            $employee = Employee::create([
                'company_id' => $by->company_id,
                'branch_id' => $data['branch_id'],
                'payroll_group_id' => $data['payroll_group_id'] ?? null,
                'employee_number' => EmployeeNumber::next($by->company_id),
                'personal' => $data['personal'],
                'employment' => [...$data['employment'], 'status' => $data['employment']['status'] ?? 'active'],
                'compensation' => self::snapshot($data['compensation']),
                'benefits' => Arr::except($data['benefits'] ?? [], ['leaveCreditsByType']),
                'government' => $data['government'] ?? [],
                'bank' => $data['bank'] ?? [],
            ]);
            self::recordCompensation($employee, $employee->compensation, 'Initial Hire', $employee->employment['dateHired'], $by);
            BranchDepartment::ensure($employee->branch_id, $employee->department);

            // The year's leave credits (pro-rated for the hire year); amounts typed on the form replace the defaults.
            LeaveDefaults::ensure($employee->company_id);
            LeaveLedger::grantYear($employee, now()->year, $by);
            foreach ($data['benefits']['leaveCreditsByType'] ?? [] as $name => $credits) {
                if ($type = LeaveType::where('company_id', $employee->company_id)->where('name', $name)->first()) {
                    LeaveLedger::setBalance($employee, $type, (float) $credits, $by, 'Set when hired');
                }
            }

            return $employee;
        });
    }

    /**
     * The employee's current pay as stored on the record. A mixed structure decides the pay type and base amount.
     *
     * @param  array<string, mixed>  $c
     * @return array<string, mixed>
     */
    public static function snapshot(array $c): array
    {
        $mixed = $c['mixed'] ?? null;
        $payType = $mixed['baseType'] ?? $c['payType'];

        return [
            'basicPay' => (float) ($mixed['baseAmount'] ?? $c['basicPay']),
            'payType' => $payType,
            'outputUnit' => $payType === 'output_based' ? ($c['outputUnit'] ?? null) : null,
            'allowances' => array_map(fn ($a) => ['label' => $a['label'], 'amount' => (float) $a['amount']], $c['allowances'] ?? []),
            ...($mixed ? ['mixed' => [
                'baseType' => $mixed['baseType'], 'baseAmount' => (float) $mixed['baseAmount'], 'componentType' => $mixed['componentType'], 'rate' => (float) $mixed['rate'],
            ]] : []),
        ];
    }

    /** @param array<string, mixed> $pay a snapshot */
    public static function recordCompensation(Employee $employee, array $pay, string $reason, string $effectiveFrom, User $by): void
    {
        EmployeeCompensation::create([
            'company_id' => $employee->company_id,
            'employee_id' => $employee->id,
            'effective_from' => $effectiveFrom,
            'rate_type' => $pay['payType'],
            'basic_rate' => $pay['basicPay'],
            'output_unit' => $pay['outputUnit'] ?? null,
            'allowances' => $pay['allowances'],
            'mixed' => $pay['mixed'] ?? null,
            'reason' => $reason,
            'changed_by' => $by->id,
        ]);
    }
}
