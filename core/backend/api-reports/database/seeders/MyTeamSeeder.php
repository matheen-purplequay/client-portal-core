<?php

namespace Database\Seeders;

use App\Models\MyTeam;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MyTeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/myteam.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            MyTeam::factory()->create([
                'company_id' => $j['company_id'],
                'name' => $j['name'],
                'role' => $j['role'],
                'vertical' => $j['vertical'],
                'email' => $j['email'],
            ]);
        }
    }
}
