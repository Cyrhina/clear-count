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
        $company = Company::create(['name' => 'Frontline Business Solutions', 'plan_tier' => 'professional_plus']);
        $head = Branch::withoutGlobalScopes()->create([
            'company_id' => $company->id, 'name' => 'Head Office', 'code' => 'FBS-HO', 'is_head_office' => true,
        ]);

        Employee::factory()->count(12)->create(['company_id' => $company->id, 'branch_id' => $head->id]);
        $own = Employee::withoutGlobalScopes()->where('company_id', $company->id)->first();

        $accounts = [
            ['Andrea', 'Villareal', 'andrea.villareal@fbs.com', 'company_admin', null],
            ['Grace', 'Ocampo', 'hr@fbs.com', 'hr_admin', null],
            ['Payroll', 'Manager', 'payroll@fbs.com', 'payroll_admin', null],
            ['Demo', 'Employee', 'employee@fbs.com', 'employee', $own?->id],
        ];

        $users = new UserSeeder;

        foreach ($accounts as [$firstName, $lastName, $email, $role, $employeeId]) {
            $users->createUser($firstName, $lastName, $email, $role, attributes: [
                'company_id' => $company->id,
                'branch_id' => $head->id,
                'employee_id' => $employeeId,
            ]);
        }

        // The accounts listed on the login page (UserSeeder) belong to the demo company too: without a company
        // they would see no users, no company profile and no activity log. The super admin stays company-less.
        User::whereIn('email', UserSeeder::DEMO_LOGIN_EMAILS)->update(['company_id' => $company->id, 'branch_id' => $head->id]);
    }
}
