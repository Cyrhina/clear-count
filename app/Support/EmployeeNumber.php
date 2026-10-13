<?php

namespace App\Support;

use App\Models\Company;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

/** Hands out the next employee number of a company (EMP-0001, EMP-0002 ...). Call it inside the transaction that creates the employee. */
final class EmployeeNumber
{
    public static function next(int $companyId): string
    {
        return DB::transaction(function () use ($companyId) {
            $company = Company::whereKey($companyId)->lockForUpdate()->firstOrFail();

            // Numbers typed in by hand or imported may already use the next one; skip them.
            do {
                $company->employee_sequence++;
                $number = sprintf('EMP-%04d', $company->employee_sequence);
            } while (Employee::withoutGlobalScopes()->where('company_id', $companyId)->where('employee_number', $number)->exists());

            $company->save();

            return $number;
        });
    }
}
