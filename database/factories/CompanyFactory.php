<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            // Everything unlocked and no seat limit, so a test only meets a plan rule when it asks for one.
            'plan_tier' => 'enterprise',
            'timezone' => 'Asia/Manila',
            'payroll_frequency' => 'semi_monthly',
        ];
    }
}
