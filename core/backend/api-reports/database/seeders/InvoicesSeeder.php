<?php

namespace Database\Seeders;

use App\Models\Invoices;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InvoicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = storage_path() . "/json/invoices.json";
        $json = json_decode(file_get_contents($path), true); 

        foreach ($json as $j) {
            Invoices::factory()->create([
                'client_id' => $j['client_id'],
                'invoice_number' => $j['invoice_number'],
                'name' => $j['name'],
                'date' => $j['date'],
                'file' => $j['file']
            ]);
        }
    }
}
