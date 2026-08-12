<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Permissions
        $superPermissions = [
            'apps.create',
            'apps.view.all', 'apps.view.own',
            'apps.update.all', 'apps.update.own',
            'apps.delete.all', 'apps.delete.own',
            'projects.create',
            'projects.view.all', 'projects.view.own',
            'projects.update.all', 'projects.update.own',
            'projects.delete.all', 'projects.delete.own',
            'users.create',
            'users.view.all', 'users.view.own',
            'users.update.all', 'users.update.own',
            'users.delete.all', 'users.delete.own',
            'contacts.create', 
            'contacts.view.all', 'contacts.view.own',
            'contacts.update.all', 'contacts.update.own',
            'contacts.delete.all', 'contacts.delete.own',
            'companies.create',
            'companies.view.all', 'companies.view.own',
            'companies.update.all', 'companies.update.own',
            'companies.delete.all', 'companies.delete.own',
            'associates.create',
            'associates.view.all', 'associates.view.own',
            'associates.update.all', 'associates.update.own',
            'associates.delete.all', 'associates.delete.own',
            'addresses.create',
            'addresses.view.all', 'addresses.view.own',
            'addresses.update.all', 'addresses.update.own',
            'addresses.delete.all', 'addresses.delete.own',
            'locations.create',
            'locations.view.all', 'locations.view.own',
            'locations.update.all', 'locations.update.own',
            'locations.delete.all', 'locations.delete.own',
            'reports.create',
            'reports.view.all', 'reports.view.own',
            'reports.update.all', 'reports.update.own',
            'reports.delete.all', 'reports.delete.own',
            'invoices.create',
            'invoices.view.all', 'invoices.view.own',
            'invoices.update.all', 'invoices.update.own',
            'invoices.delete.all', 'invoices.delete.own'
        ];

        // Partner Permissions
        $partnerPermissions = [
            'apps.view.all', 'apps.view.own',
            'apps.update.all', 'apps.update.own',
            'apps.delete.all', 'apps.delete.own',
            'projects.view.all', 'projects.view.own',
            'projects.update.all', 'projects.update.own',
            'projects.delete.all', 'projects.delete.own',
            'users.view.all', 'users.view.own',
            'users.update.all', 'users.update.own',
            'users.delete.all', 'users.delete.own',
            'contacts.view.all', 'contacts.view.own',
            'contacts.update.all', 'contacts.update.own',
            'contacts.delete.all', 'contacts.delete.own',
            'companies.view.all', 'companies.view.own',
            'companies.update.all', 'companies.update.own',
            'companies.delete.all', 'companies.delete.own',
            'associates.view.all', 'associates.view.own',
            'associates.update.all', 'associates.update.own',
            'associates.delete.all', 'associates.delete.own',
            'addresses.view.all', 'addresses.view.own',
            'addresses.update.all', 'addresses.update.own',
            'addresses.delete.all', 'addresses.delete.own',
            'locations.view.all', 'locations.view.own',
            'locations.update.all', 'locations.update.own',
            'locations.delete.all', 'locations.delete.own',
            'reports.view.all', 'reports.view.own',
            'reports.update.all', 'reports.update.own',
            'reports.delete.all', 'reports.delete.own',
            'invoices.view.all', 'invoices.view.own',
            'invoices.update.all', 'invoices.update.own',
            'invoices.delete.all', 'invoices.delete.own'
        ];

        // Client Partner Permissions
        $clientPartnerPermissions = [
            'apps.view.own',
            'apps.update.own',
            'apps.delete.own',
            'projects.view.own',
            'projects.update.own',
            'projects.delete.own',
            'users.view.own',
            'users.update.own',
            'users.delete.own',
            'companies.view.own',
            'associates.view.own',
            'reports.view.own',
            'invoices.view.own'
        ];

        // Client Manager Permissions
        $clientManagerPermissions = [
            'apps.view.own',
            'apps.update.own',
            'apps.delete.own',
            'projects.view.own',
            'projects.update.own',
            'projects.delete.own',
            'users.view.own',
            'users.update.own',
            'users.delete.own',
            'companies.view.own',
            'associates.view.own',
            'reports.view.own',
            'invoices.view.own'
        ];

        // Team Lead Permissions
        $teamLeadPermissions = [
            'users.view.own',
            'companies.view.own',
            'associates.view.own',
            'reports.view.own',
            'invoices.view.own'
        ];

        foreach ($superPermissions as $permissionName) {
            Permission::create(['name' => $permissionName]);
        }

        // Partner/Business Owner Role and Permissions
        $clientPartner = Role::create(['name' => 'client_partner']);
        $clientPartner->givePermissionTo($clientPartnerPermissions);
        
        // Client Manager Role and Permissions
        $clientManagerRole = Role::create(['name' => 'client_manager']);
        $clientManagerRole->givePermissionTo($clientManagerPermissions);

        // System Associate / Tech Admin Role and Permissions
        // $systemAssociate = Role::create(['name' => 'system_associate']);
        // $systemAssociate->givePermissionTo($permissions);

        // Team Lead Role and Permissions
        $teamLead = Role::create(['name' => 'system_associate']);
        $teamLead->givePermissionTo($teamLeadPermissions);

        // Marketing Role and Permissions
        // $marketingAssociate = Role::create(['name' => 'system_associate']);
        // $marketingAssociate->givePermissionTo($permissions);

        // Super Admin Roles and Permissions
        $superRole = Role::create(['name' => 'super']);
        $superRole->givePermissionTo($superPermissions);
    }
}