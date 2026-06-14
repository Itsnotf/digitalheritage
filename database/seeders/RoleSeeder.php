<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // =========================================================
        // ADMIN
        // =========================================================
        // Mendapat akses penuh ke seluruh permission yang terdaftar:
        // - Manajemen user & role
        // - Moderasi konten (lihat, setujui, tolak, hapus)
        // - Manajemen kategori, wilayah, tag
        // - Moderasi komentar
        // - Manajemen halaman (CMS)
        // - Monitoring aktivitas platform
        // =========================================================
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        // =========================================================
        // USER
        // =========================================================
        // Pengguna biasa tidak memerlukan permission Spatie.
        // Seluruh akses mereka (kontribusi, rating, komentar)
        // dikontrol via middleware `auth`, bukan permission middleware.
        // =========================================================
        $user = Role::firstOrCreate(['name' => 'user']);
        $user->syncPermissions([]);
    }
}
