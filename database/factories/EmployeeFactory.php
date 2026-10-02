<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $branch = Branch::factory();

        return [
            'company_id' => fn (array $attrs) => Branch::withoutGlobalScopes()->find($attrs['branch_id'])->company_id,
            'branch_id' => $branch,
            'employee_number' => 'FR-'.fake()->unique()->numerify('####'),
            'personal' => [
                'firstName' => fake()->firstName(),
                'lastName' => fake()->lastName(),
                'birthDate' => fake()->date(),
                'civilStatus' => 'single',
                'address' => fake()->address(),
                'contactNumber' => fake()->numerify('09#########'),
            ],
            'employment' => [
                'position' => fake()->jobTitle(),
                'department' => fake()->randomElement(['Operations', 'Finance', 'HR', 'Sales']),
                'employmentType' => 'regular',
                'dateHired' => fake()->date(),
                'status' => 'active',
                'category' => 'regular',
            ],
            'compensation' => [
                'basicPay' => 25000,
                'payType' => 'monthly',
                'allowances' => [],
            ],
            'benefits' => ['leaveCreditsByType' => []],
            'government' => [],
            'bank' => [],
        ];
    }
}
