<?php

namespace Database\Seeders;

use App\Models\KnowledgeCenter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KnowledgeCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/knowledgecenter.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            KnowledgeCenter::factory()->create([
                'title' => $j['title'],
                'description' => $j['description'],
                'link' => $j['link'],
                'type' => $j['type'],
                'link_type' => $j['link_type'],
                'image' => $j['image'],
                'category' => $j['category']
            ]);
        }
    }
}
