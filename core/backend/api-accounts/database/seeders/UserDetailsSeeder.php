<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserDetails;


class UserDetailsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/userdetails.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            UserDetails::factory()->create([
                'remarks' => fake()->text,
                'date_of_birth' => fake()->date,
                'status' => $j['status'],
                'role' => $j['role'],
                'user_id' => $j['user_id'],
                'company_id' => $j['company_id']
            ]);
        }
    }
}
