<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HolidaysSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Holidays::factory()->create([
            "month" => 'August',
            "day" => '16-08-2023',
            "reason" => 'Independence day',
            "type" => 'National',
            "country" => "India",
            "remarks" => '3rd Saturday is a full working day'
        ]);
        \App\Models\Holidays::factory()->create([
            "month" => 'September',
            "day" => '19-09-2023',
            "reason" => 'Ganesh Chaturthi',
            "type" => 'Public',
            "country" => "India",
            "remarks" => '3rd Saturday is a full working day'
        ]);
        \App\Models\Holidays::factory()->create([
            "month" => 'October',
            "day" => '02-10-2023',
            "reason" => 'Gandhi Jayanti',
            "type" => 'Public',
            "country" => "India",
            "remarks" => '3rd Saturday is a full working day'
        ]);
        \App\Models\Holidays::factory()->create([
            "month" => 'November',
            "day" => '14-11-2023',
            "reason" => 'Diwali',
            "type" => 'Public',
            "country" => "India",
            "remarks" => '3rd Saturday is a full working day'
        ]);
        \App\Models\Holidays::factory()->create([
            "month" => 'December',
            "day" => '25-12-2023',
            "reason" => 'Christmas Day',
            "type" => 'National',
            "country" => "India",
            "remarks" => '3rd Saturday is a full working day'
        ]);
        \App\Models\Holidays::factory()->create([
            "month" => 'December',
            "day" => '25-12-2023',
            "reason" => 'Christmas Day',
            "type" => 'National',
            "country" => "Australia",
            "remarks" => '3rd Saturday is a full working day'
        ]);
    }
}
