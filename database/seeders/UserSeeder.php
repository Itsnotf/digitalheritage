<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin default
        $admin = User::firstOrCreate(
            ['email' => 'admin@budayasumsel.id'],
            [
                'name'               => 'Admin Budaya Sumsel',
                'password'           => bcrypt('password'),
                'email_verified_at'  => now(),
            ]
        );
        $admin->assignRole('admin');

        // Sample user biasa untuk development
        $user = User::firstOrCreate(
            ['email' => 'user@budayasumsel.id'],
            [
                'name'              => 'Kontributor Demo',
                'password'          => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('user');

        // 8 user tambahan (factory) — hanya saat fresh seed
        if (User::count() < 3) {
            User::factory(8)->create()->each(fn($u) => $u->assignRole('user'));
        }
    }
}
