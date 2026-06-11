<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = [
        'konten_id',
        'user_id',
        'parent_id',
        'isi',
        'status',
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

    /** Komentar induk (null jika ini adalah komentar utama) */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /** Balasan komentar ini */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')
                    ->where('status', 'aktif')
                    ->oldest();
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    public function isReply(): bool
    {
        return !is_null($this->parent_id);
    }
}
