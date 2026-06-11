<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModerationLog extends Model
{
    protected $fillable = [
        'konten_id',
        'user_id',
        'aksi',
        'catatan',
    ];

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    public function konten(): BelongsTo
    {
        return $this->belongsTo(KontenBudaya::class, 'konten_id');
    }

    /** Bisa admin (saat approve/reject) atau user (saat user_revise/user_decline) */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    public function isAdminAction(): bool
    {
        return in_array($this->aksi, ['approve', 'reject']);
    }

    public function isUserAction(): bool
    {
        return in_array($this->aksi, ['user_revise', 'user_decline']);
    }

    /** Label aksi yang ramah untuk ditampilkan di UI */
    public function aksiLabel(): string
    {
        return match ($this->aksi) {
            'approve'      => 'Disetujui',
            'reject'       => 'Ditolak',
            'user_revise'  => 'Pengguna memilih revisi',
            'user_decline' => 'Pengguna tidak merevisi',
            default        => $this->aksi,
        };
    }
}
