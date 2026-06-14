<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class KontenBudaya extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'wilayah_id',
        'judul',
        'slug',
        'deskripsi',
        'status',
        'catatan_admin',
        'cover_url',
        'view_count',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'view_count'  => 'integer',
        'user_id'     => 'integer',
        'category_id' => 'integer',
        'wilayah_id'  => 'integer',
        'approved_by' => 'integer',
    ];

    // -------------------------------------------------------
    // Relasi
    // -------------------------------------------------------

    /** User yang mengupload konten ini */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Kategori budaya */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** Wilayah asal konten */
    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }

    /** Admin yang menyetujui konten */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** Semua file media (gambar, video, audio, dokumen) */
    public function mediaFiles(): HasMany
    {
        return $this->hasMany(MediaFile::class, 'konten_id')->orderBy('urutan');
    }

    /** File media yang dijadikan cover/thumbnail utama */
    public function primaryMedia(): HasOne
    {
        return $this->hasOne(MediaFile::class, 'konten_id')->where('is_primary', true);
    }

    /** Video pertama — dipakai untuk preview durasi di galeri list */
    public function firstVideo(): HasOne
    {
        return $this->hasOne(MediaFile::class, 'konten_id')
                    ->where('tipe', 'video')
                    ->orderBy('urutan');
    }

    /** Tags yang melekat pada konten ini */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'konten_tags', 'konten_id', 'tag_id');
    }

    /** Komentar (hanya level pertama, bukan balasan) */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'konten_id')
                    ->whereNull('parent_id')
                    ->where('status', 'aktif')
                    ->latest();
    }

    /** Semua komentar termasuk balasan */
    public function allComments(): HasMany
    {
        return $this->hasMany(Comment::class, 'konten_id');
    }

    /** Rating dari semua user */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'konten_id');
    }

    /** Log moderasi — urut dari yang terbaru */
    public function moderationLogs(): HasMany
    {
        return $this->hasMany(ModerationLog::class, 'konten_id')->latest();
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // -------------------------------------------------------
    // Scopes
    // -------------------------------------------------------

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------

    /** Rata-rata rating, null jika belum ada yang rating */
    public function averageRating(): ?float
    {
        $avg = $this->ratings()->avg('skor');
        return $avg ? round($avg, 1) : null;
    }

    /** Tambah view count sebesar 1 */
    public function incrementView(): void
    {
        $this->increment('view_count');
    }

    /** True jika konten ini pernah ditolak sebelumnya (ada log reject) */
    public function pernahDitolak(): bool
    {
        return $this->moderationLogs()->where('aksi', 'reject')->exists();
    }
}
