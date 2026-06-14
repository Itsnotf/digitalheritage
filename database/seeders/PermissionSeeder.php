<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache permission Spatie agar assignment langsung efektif
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (array_keys(config('starterkit.permissions')) as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
