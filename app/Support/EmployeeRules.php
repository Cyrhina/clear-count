<?php

namespace App\Support;

use Illuminate\Validation\Rule;

/**
 * Validation rules of the employee record, one method per section, shared by the create request and the section updates.
 * Section keys keep the camelCase of the stored JSON (see Employee).
 */
final class EmployeeRules
{
    /** @return array<string, array<int, mixed>> */
    public static function personal(string $p = 'personal'): array
    {
        return [
            "$p.firstName" => ['required', 'string', 'max:100'],
            "$p.lastName" => ['required', 'string', 'max:100'],
            "$p.birthDate" => ['required', 'date'],
            "$p.civilStatus" => ['required', Rule::in(['single', 'married', 'widowed', 'separated'])],
            "$p.address" => ['required', 'string', 'max:255'],
            "$p.contactNumber" => ['required', 'string', 'max:30'],
            "$p.personalEmail" => ['nullable', 'email', 'max:255'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function employment(string $p = 'employment'): array
    {
        return [
            "$p.position" => ['required', 'string', 'max:100'],
            "$p.department" => ['required', 'string', 'max:100'],
            "$p.employmentType" => ['required', Rule::in(['regular', 'probationary', 'contractual', 'part_time'])],
            "$p.dateHired" => ['required', 'date'],
            "$p.category" => ['required', Rule::in(['regular', 'admin_staff', 'production_worker', 'field_worker', 'contractor'])],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function compensation(string $p = 'compensation'): array
    {
        return [
            "$p.basicPay" => ['required', 'numeric', 'min:0', 'max:100000000'],
            "$p.payType" => ['required', Rule::in(['monthly', 'semi_monthly', 'daily', 'hourly', 'output_based'])],
            "$p.outputUnit" => ['nullable', 'string', 'max:60'],
            "$p.allowances" => ['nullable', 'array', 'max:30'],
            "$p.allowances.*.label" => ['required', 'string', 'max:100'],
            "$p.allowances.*.amount" => ['required', 'numeric', 'min:0', 'max:100000000'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function benefits(string $p = 'benefits'): array
    {
        return [
            "$p.hmoPlan" => ['nullable', 'string', 'max:100'],
            "$p.leaveCreditsByType" => ['nullable', 'array', 'max:30'],
            "$p.leaveCreditsByType.*" => ['numeric', 'min:0', 'max:1000'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function government(string $p = 'government'): array
    {
        return [
            "$p.sssNo" => ['nullable', 'string', 'max:30'],
            "$p.philhealthNo" => ['nullable', 'string', 'max:30'],
            "$p.pagibigNo" => ['nullable', 'string', 'max:30'],
            "$p.tinNo" => ['nullable', 'string', 'max:30'],
            "$p.pagibigEmployeeContribution" => ['nullable', 'numeric', 'min:0', 'max:1000000'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function bank(string $p = 'bank'): array
    {
        return [
            "$p.bankName" => ['nullable', 'string', 'max:100'],
            "$p.accountNumber" => ['nullable', 'string', 'max:40'],
        ];
    }
}
