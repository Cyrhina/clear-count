<?php

namespace Database\Seeders;

use App\Support\Capabilities;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Capabilities::all() as $capability) {
            Permission::findOrCreate($capability, 'web');
        }

        foreach (Capabilities::ROLE_PERMISSIONS as $role => $capabilities) {
            Role::findOrCreate($role, 'web')->syncPermissions($capabilities);
        }
    }
}
