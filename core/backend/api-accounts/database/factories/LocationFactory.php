<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'address_line_1' => fake()->streetAddress,
            'address_line_2' => fake()->optional()->streetAddress,
            'province' => fake()->state,
            'city' => fake()->city,
            'state' => fake()->state,
            'country' => fake()->country,
            'pincode' => fake()->postcode,
            'company_id' => function () {
                $users = \App\Models\Company::pluck('id')->toArray();
                return fake()->randomElement($users);
            }
        ];
    }
}
