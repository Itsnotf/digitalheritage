<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\KontenBudaya;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardService
{
    public function adminStats(): array
    {
        return [
            // Stats user & system
            'total_users'       => User::count(),
            'total_roles'       => Role::count(),
            'total_permissions' => Permission::count(),
            'recent_users'      => User::with('roles')->latest()->take(5)->get(),

            // Stats konten budaya
            'total_konten_pending'   => KontenBudaya::pending()->count(),
            'total_konten_published' => KontenBudaya::published()->count(),
            'total_konten_rejected'  => KontenBudaya::rejected()->count(),
            'total_komentar'         => Comment::count(),

            // Konten terbaru yang menunggu review (prioritas utama admin)
            'pending_terbaru' => KontenBudaya::with(['user', 'category', 'wilayah', 'primaryMedia'])
                ->pending()
                ->latest()
                ->take(5)
                ->get(),
        ];
    }

    public function memberStats(User $user): array
    {
        $kontenSaya = KontenBudaya::where('user_id', $user->id);

        return [
            // Info akun
            'roles'        => $user->getRoleNames(),
            'member_since' => $user->created_at->format('d M Y'),

            // Statistik kontribusi
            'total_konten'           => (clone $kontenSaya)->count(),
            'total_konten_pending'   => (clone $kontenSaya)->pending()->count(),
            'total_konten_published' => (clone $kontenSaya)->published()->count(),
            'total_konten_rejected'  => (clone $kontenSaya)->rejected()->count(),
            'total_views'            => (clone $kontenSaya)->sum('view_count'),

            // Konten terbaru milik user ini
            'konten_terbaru' => KontenBudaya::with(['category', 'wilayah', 'primaryMedia'])
                ->where('user_id', $user->id)
                ->latest()
                ->take(5)
                ->get(),
        ];
    }
}
