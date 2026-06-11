<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaFile extends Model
{
    protected $fillable = [
        'konten_id',
        'tipe',
        'url',
        'filename',
        'mime_type',
        'ukuran_kb',
        'durasi_detik',
        'thumbnail_url',
        'is_primary',
        'urutan',
    ];

    protected $casts = [
        'is_primary'    => 'boolean',
        'ukuran_kb'     => 'integer',
        'durasi_detik'  => 'integer',
        'urutan'        => 'integer',
    ];

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    public function konten(): BelongsTo
    {
        return $this->belongsTo(KontenBudaya::class, 'konten_id');
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    /** URL yang dipakai sebagai pratinjau — thumbnail jika ada, fallback ke url asli */
    public function previewUrl(): string
    {
        return $this->thumbnail_url ?? $this->url;
    }

    /** Ukuran file dalam format human-readable (KB / MB) */
    public function ukuranFormatted(): string
    {
        if ($this->ukuran_kb >= 1024) {
            return round($this->ukuran_kb / 1024, 1) . ' MB';
        }

        return $this->ukuran_kb . ' KB';
    }

    /** Durasi dalam format mm:ss (untuk audio/video) */
    public function durasiFormatted(): ?string
    {
        if (is_null($this->durasi_detik)) {
            return null;
        }

        $menit = intdiv($this->durasi_detik, 60);
        $detik = $this->durasi_detik % 60;

        return sprintf('%d:%02d', $menit, $detik);
    }

    /** True jika file ini adalah gambar */
    public function isImage(): bool
    {
        return $this->tipe === 'image';
    }

    /** True jika file ini adalah video */
    public function isVideo(): bool
    {
        return $this->tipe === 'video';
    }

    /** True jika file ini adalah audio */
    public function isAudio(): bool
    {
        return $this->tipe === 'audio';
    }

    /** True jika file ini adalah dokumen */
    public function isDocument(): bool
    {
        return $this->tipe === 'document';
    }
}
