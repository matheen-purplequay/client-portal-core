<?php

namespace Database\Seeders;

use App\Models\ConnectReports;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConnectReportsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/connectreports.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            ConnectReports::factory()->create([
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
