<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\MyTeam;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        $this->call([
            ConnectReportsSeeder::class,
            WeeklyReportsSeeder::class,
            InvoicesSeeder::class,
            HolidaysSeeder::class,
            MyTeamSeeder::class,
            NewsLettersSeeder::class,
            KnowledgeCenterSeeder::class,
            ITSeeder::class,
            UsersSeeder::class
        ]);

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
