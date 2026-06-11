<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    protected $fillable = [
        'konten_id',
        'user_id',
        'skor',
    ];

    protected $casts = [
        'skor' => 'integer',
    ];

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    public function konten(): BelongsTo
    {
        return $this->belongsTo(KontenBudaya::class, 'konten_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
