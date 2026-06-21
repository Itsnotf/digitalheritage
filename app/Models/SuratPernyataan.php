<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class SuratPernyataan extends Model
{
    protected $table = 'surat_pernyataan';

    protected $fillable = [
        'file_path',
        'filename',
        'ukuran_kb',
        'uploaded_by',
    ];

    /** Admin yang terakhir mengupload/mengganti template */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** URL publik file, atau null jika belum pernah diupload */
    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    /**
     * Tabel ini selalu cuma punya 1 baris. Ambil baris itu,
     * buat baris kosong dulu kalau belum ada sama sekali.
     */
    public static function current(): static
    {
        return static::query()->firstOrCreate([]);
    }
}
