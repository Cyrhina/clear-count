<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityLog>
 */
class ActivityLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'actor' => fake()->name(),
            'module' => fake()->randomElement(['Attendance', 'Employees', 'Payroll', 'Leave', 'Reports']),
            'action' => fake()->randomElement(['Approved', 'Viewed', 'Processed', 'Updated', 'Added']),
            'title' => fake()->words(2, true),
            'description' => fake()->sentence(),
        ];
    }
}
