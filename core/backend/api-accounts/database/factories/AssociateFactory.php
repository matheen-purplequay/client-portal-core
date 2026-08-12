<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Associate>
 */
class AssociateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['Primary', 'Secondary', 'Custom']);

        return [
            'first_name' => fake()->firstName,
            'last_name' => fake()->optional()->lastName,
            'email' => fake()->unique()->safeEmail,
            'phone' => fake()->phoneNumber,
            'type' => $type,
            'custom_contact_type' => ($type == 'Custom') ? fake()->word : '',
            'company_id' => function () {
                $companies = \App\Models\Company::pluck('id')->toArray();
                return fake()->randomElement($companies);
            }
        ];
    }
}
