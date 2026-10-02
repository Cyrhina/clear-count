<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::create(['name' => 'Frontline Business Solutions', 'plan_tier' => 'professional']);
        $head = Branch::withoutGlobalScopes()->create([
            'company_id' => $company->id, 'name' => 'Head Office', 'code' => 'FBS-HO', 'is_head_office' => true,
        ]);

        Employee::factory()->count(12)->create(['company_id' => $company->id, 'branch_id' => $head->id]);
        $own = Employee::withoutGlobalScopes()->where('company_id', $company->id)->first();

        $accounts = [
            ['Andrea Villareal', 'andrea.villareal@fbs.com', 'company_admin', null],
            ['Payroll Manager', 'payroll@fbs.com', 'payroll_admin', null],
            ['Demo Employee', 'employee@fbs.com', 'employee', $own?->id],
        ];

        foreach ($accounts as [$name, $email, $role, $employeeId]) {
            User::factory()->create([
                'name' => $name,
                'email' => $email,
                'password' => 'password123',
                'company_id' => $company->id,
                'branch_id' => $head->id,
                'employee_id' => $employeeId,
            ])->assignRole($role);
        }
    }
}
