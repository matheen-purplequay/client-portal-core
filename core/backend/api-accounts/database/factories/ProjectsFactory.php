<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Projects>
 */
class ProjectsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'start_date' => fake()->date(),
            'status' => fake()->randomElement(['active', 'inactive', 'hold', 'dormant']),
            'company_id' => function () {
                $companies = \App\Models\Company::pluck('id')->toArray();
                return fake()->randomElement($companies);
            }
        ];
    }
}
