<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public const DEFAULT_PASSWORD = '123123qQ!';

    public function run(): void
    {
        // Standalone accounts; DemoSeeder reuses createUser() for company-scoped ones.
        $this->call(RoleSeeder::class);

        $this->createUser('Admin', 'User', 'admin@fbs.com', 'super_admin');
        $this->createUser('Lyzette', 'Consignado', 'company_admin.consignado@frontlinebusiness.com.ph', 'company_admin');
        $this->createUser('Lyzette', 'Consignado', 'hr_admin.consignado@frontlinebusiness.com.ph', 'hr_admin');
        $this->createUser('Lyzette', 'Consignado', 'payroll_admin.consignado@frontlinebusiness.com.ph', 'payroll_admin');
        $this->createUser('Lyzette', 'Consignado', 'manager.consignado@frontlinebusiness.com.ph', 'manager');
        $this->createUser('Lyzette', 'Consignado', 'employee.consignado@frontlinebusiness.com.ph', 'employee');
        $this->createUser('Emmanuel', 'Manalo', 'emmanuel.manalo@frontlinebusiness.com.ph', 'company_admin');
    }

    /**
     * Create (or update) a user by email and optionally assign a role.
     *
     * @param  array<string, mixed>  $attributes  Extra columns, e.g. company_id, branch_id, employee_id.
     */
    public function createUser(
        string $firstName,
        string $lastName,
        string $email,
        ?string $role = null,
        string $password = self::DEFAULT_PASSWORD,
        array $attributes = [],
    ): User {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'password' => $password,
                'email_verified_at' => now(),
                'is_active' => true,
                ...$attributes,
            ],
        );

        if ($role !== null) {
            $user->syncRoles($role);
        }

        return $user;
    }
}
