<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AssignRoles extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superRole = Role::where('name', 'super')->first();
        $user1 = User::where('id', 1)->first();
        $user1->assignRole($superRole);
        $user1->syncRoles([$superRole]);
        $user1->save();
    }
}
