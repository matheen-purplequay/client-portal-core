<?php

namespace Database\Seeders;

use App\Models\Newsletters;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NewsLettersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/newsletters.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            Newsletters::factory()->create([
                'title' => $j['title'],
                'month' => $j['month'],
                'year' => $j['year'],
                'link' => $j['link']
            ]);
        }
    }
}
