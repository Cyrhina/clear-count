<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => fake()->city().' Branch',
            'code' => strtoupper(fake()->lexify('???-HO')),
            'is_head_office' => false,
            'city' => fake()->city(),
        ];
    }
}
