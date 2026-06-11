<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'bio',
        'avatar',
        'wilayah_id',
        'approved_konten_count',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'password'               => 'hashed',
            'two_factor_confirmed_at'=> 'datetime',
            'approved_konten_count'  => 'integer',
        ];
    }

    public function getUserPermissions()
    {
        return $this->getAllPermissions()->mapWithKeys(fn($permission) => [$permission['name'] => true]);
    }

    // -------------------------------------------------------
    // Sistem Level
    // -------------------------------------------------------

    /**
     * Level user berdasarkan jumlah konten yang disetujui.
     * 1 = Pendatang, 2 = Pemuda, 3 = Penjaga, 4 = Duta Budaya, 5 = Maestro
     */
    public function getLevel(): int
    {
        return match(true) {
            $this->approved_konten_count >= 30 => 5,
            $this->approved_konten_count >= 15 => 4,
            $this->approved_konten_count >= 5  => 3,
            $this->approved_konten_count >= 1  => 2,
            default                            => 1,
        };
    }

    /**
     * Nama level dalam bahasa Indonesia.
     */
    public function getLevelName(): string
    {
        return match($this->getLevel()) {
            5 => 'Maestro',
            4 => 'Duta Budaya',
            3 => 'Penjaga',
            2 => 'Pemuda',
            1 => 'Pendatang',
        };
    }

    /**
     * Identifier warna ramp untuk badge level (cocok dengan c-* di SVG dan Tailwind).
     */
    public function getLevelColor(): string
    {
        return match($this->getLevel()) {
            5 => 'coral',
            4 => 'purple',
            3 => 'teal',
            2 => 'amber',
            1 => 'gray',
        };
    }

    /**
     * Berapa konten lagi yang dibutuhkan untuk naik ke level berikutnya.
     * Null jika sudah di level maksimal.
     */
    public function getKontenToNextLevel(): ?int
    {
        $thresholds = [1, 5, 15, 30];
        $level      = $this->getLevel();

        if ($level >= 5) return null;

        return $thresholds[$level - 1] - $this->approved_konten_count;
    }

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    public function wilayah(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }

    public function kontenBudayas(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(KontenBudaya::class);
    }

    public function comments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function ratings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function moderationLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ModerationLog::class);
    }
}
