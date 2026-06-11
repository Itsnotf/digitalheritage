<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'nama',
        'slug',
        'deskripsi',
        'icon',
        'parent_id',
        'urutan',
    ];

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    /** Kategori induk (null jika ini adalah kategori utama) */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /** Sub-kategori dari kategori ini */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('urutan');
    }

    /** Semua konten dalam kategori ini */
    public function kontenBudayas(): HasMany
    {
        return $this->hasMany(KontenBudaya::class, 'category_id');
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    /** True jika kategori ini adalah kategori utama (bukan sub-kategori) */
    public function isRoot(): bool
    {
        return is_null($this->parent_id);
    }
}
