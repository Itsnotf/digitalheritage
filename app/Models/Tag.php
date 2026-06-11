<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = [
        'nama',
        'slug',
    ];

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    public function kontenBudayas(): BelongsToMany
    {
        return $this->belongsToMany(KontenBudaya::class, 'konten_tags', 'tag_id', 'konten_id');
    }
}
