<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SitePage extends Model
{
    protected $fillable = [
        'key',
        'title',
        'subtitle',
        'hero_image',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    // -------------------------------------------------------
    // Accessors
    // -------------------------------------------------------

    /** URL publik hero image, atau null jika belum di-set */
    public function getHeroImageUrlAttribute(): ?string
    {
        return $this->hero_image
            ? Storage::url($this->hero_image)
            : null;
    }

    /** Ambil satu nilai dari content JSON dengan fallback */
    public function get(string $key, mixed $default = null): mixed
    {
        return $this->content[$key] ?? $default;
    }

    // -------------------------------------------------------
    // Static helpers
    // -------------------------------------------------------

    /** Ambil page by key, buat default jika belum ada */
    public static function forKey(string $key): static
    {
        return static::firstOrCreate(['key' => $key]);
    }
}
