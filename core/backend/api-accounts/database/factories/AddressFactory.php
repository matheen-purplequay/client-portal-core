<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $addressType = fake()->randomElement(['Home', 'Work', 'Custom', 'Others']);

        return [
            'address_type' => $addressType,
            'custom_address_type' => ($addressType == 'Custom') ? fake()->word : null,
            'address_line_1' => fake()->streetAddress,
            'address_line_2' => fake()->optional()->streetAddress,
            'province' => fake()->state,
            'city' => fake()->city,
            'state' => fake()->state,
            'country' => fake()->country,
            'pincode' => fake()->postcode,
            'user_id' => function () {
                $users = \App\Models\User::pluck('id')->toArray();
                return fake()->randomElement($users);
            }
        ];
    }
}
