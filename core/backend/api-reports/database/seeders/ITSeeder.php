<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\IT;

class ITSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/it.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            IT::factory()->create([
                'title' => $j['title'],
                'date_of_issue' => $j['date_of_issue'],
                'link' => $j['link']
            ]);
        }
    }
}
