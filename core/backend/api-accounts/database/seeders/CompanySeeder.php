<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Company;
use SebastianBergmann\Type\NullType;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $industryTypes = [
            'Technology',
            'Finance',
            'Healthcare',
            'Retail',
            'Manufacturing',
            'Education',
            'Entertainment',
            'Hospitality',
            'Real Estate',
            'Transportation',
            'Energy',
            'Agriculture',
            'Other',
        ];

        $clientTypes = [
            'self',
            'client',
            'sub_client',
            'vendor'
        ];

        $path = storage_path() . "/json/companies.json"; 
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            $company_parent_id = NUll;
            if($j['parent_company_id'] != 0) $company_parent_id = $j['parent_company_id']; 
            Company::factory()->create([
                'name' => $j['name'],
                'short_name' => $j['short_name'],
                "dashboards" => $j['dashboards'],
                "works_manager_client_id" => $j['works_manager_client_id'],
                "company_logo" => $j['company_logo'],
                "parent_company_id" => $company_parent_id,
                'primary_contact_first_name' => fake()->firstName,
                'primary_contact_last_name' => fake()->optional()->lastName,
                'primary_contact_email' => fake()->unique()->safeEmail,
                'primary_contact_phone' => fake()->phoneNumber,
                'secondary_contact_first_name' => fake()->firstName,
                'secondary_contact_last_name' => fake()->optional()->lastName,
                'secondary_contact_email' => fake()->unique()->safeEmail,
                'secondary_contact_phone' => fake()->phoneNumber,
                'industry_type' => $j['industry_type'],
                'client_type' => $j['client_type'],
                'user_id' => function () {
                    $users = \App\Models\User::pluck('id')->toArray();
                    return fake()->randomElement($users);
                }
            ]);
        }
    }
}
