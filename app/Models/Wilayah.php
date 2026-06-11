<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wilayah extends Model
{
    protected $table = 'wilayah';

    protected $fillable = [
        'nama',
        'tipe',
    ];

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    public function kontenBudayas(): HasMany
    {
        return $this->hasMany(KontenBudaya::class, 'wilayah_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'wilayah_id');
    }
}
