<?php

namespace Database\Seeders;

use App\Models\WeeklyReports;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WeeklyReportsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/weeklyreports.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            WeeklyReports::factory()->create([
                'client_id' => $j['client_id'],
                'name' => $j['name'],
                'pages' => $j['pages'],
                'month' => $j['month'],
                'year' => $j['year'],
                'client_director' => $j['client_director'],
                'team_lead' => $j['team_lead'],
                'file' => $j['file']
            ]);
        }
    }
}
