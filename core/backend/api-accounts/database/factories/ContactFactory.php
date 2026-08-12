<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contact>
 */
class ContactFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName,
            'last_name' => fake()->optional()->lastName,
            'email' => fake()->unique()->safeEmail,
            'phone' => fake()->phoneNumber,
            'type' => fake()->randomElement(['Primary', 'Secondary', 'Custom']),
            'custom_contact_type' => fake()->word,
            'user_id' => function () {
                $users = \App\Models\Company::pluck('id')->toArray();
                return fake()->randomElement($users);
            }
        ];
    }
}
