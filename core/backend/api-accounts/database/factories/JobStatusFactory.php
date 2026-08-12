<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JobStatus>
 */
class JobStatusFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_description' => fake()->sentence,
            'team_lead_name' => fake()->name,
            'time_taken' => fake()->time,
            'budget_time' => fake()->time,
            'status' => fake()->randomElement(['active', 'inactive', 'dormant']),
            'date_received' => fake()->date,
            'estimated_date' => fake()->date,
            'last_touch' => fake()->date, // Random number between 1 and 30
            
            // Assuming you have a 'UserDetails' model for the foreign key relationship
            'company_id' => function () {
                $companies = \App\Models\Company::pluck('id')->toArray();
                return fake()->randomElement($companies);
            }
        ];
    }
}
