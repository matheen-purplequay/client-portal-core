<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ConnectReports>
 */
class ConnectReportsFactory extends Factory
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
            'pages' => fake()->numberBetween(1,20),
            'month' => fake()->word(),
            'year' => fake()->word(),
            'file' => fake()->word(),
            'client_id' => fake()->numberBetween(1, 10)
        ];
    }
}
