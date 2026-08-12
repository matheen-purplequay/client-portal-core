<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Projects;
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
            UserSeeder::class,
            CompanySeeder::class,
            UserDetailsSeeder::class,
            ContactSeeder::class,
            AssociateSeeder::class,
            LocationSeeder::class,
            AddressSeeder::class,
            JobStatusSeeder::class,
            RoleAndPermissionSeeder::class,
            ProjectsSeeder::class,
            AssignRoles::class,
        ]);

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
