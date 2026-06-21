<?php

namespace App\Services;

use App\Models\KontenBudaya;
use App\Models\MediaFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaFileService
{
    /**
     * Simpan array file ke storage dan buat record MediaFile.
     * File pertama (index 0) otomatis jadi primary jika belum ada primary.
     */
    public function storeFiles(KontenBudaya $konten, array $files): void
    {
        $existingCount  = $konten->mediaFiles()->count();
        $hasPrimary     = $konten->mediaFiles()->where('is_primary', true)->exists();
        $hasCover       = !is_null($konten->cover_url);

        foreach ($files as $index => $file) {
            /** @var UploadedFile $file */
            $tipe      = $this->detectType($file->getMimeType());
            $path      = $file->store("konten/{$konten->id}", 'public');
            $isPrimary = (!$hasPrimary && $index === 0);

            MediaFile::create([
                'konten_id'  => $konten->id,
                'tipe'       => $tipe,
                'url'        => $path,
                'filename'   => $file->getClientOriginalName(),
                'mime_type'  => $file->getMimeType(),
                'ukuran_kb'  => (int) ceil($file->getSize() / 1024),
                'is_primary' => $isPrimary,
                'urutan'     => $existingCount + $index,
            ]);

            if ($isPrimary) {
                $hasPrimary = true;
            }

            // cover_url hanya diambil dari file gambar pertama yang ditemukan
            if (!$hasCover && $tipe === 'image') {
                $konten->update(['cover_url' => Storage::url($path)]);
                $hasCover = true;
            }
        }
    }

    /**
     * Simpan gambar cover khusus dan set sebagai cover_url konten.
     */
    public function storeCoverImage(KontenBudaya $konten, UploadedFile $file): void
    {
        $path = $file->store("konten/{$konten->id}/covers", 'public');
        $konten->update(['cover_url' => Storage::url($path)]);
    }

    /**
     * Simpan hasil scan surat pernyataan yang sudah diisi kontributor.
     * Menimpa file lama di konten yang sama kalau ada (resubmit/ganti).
     */
    public function storeSuratPernyataan(KontenBudaya $konten, UploadedFile $file): void
    {
        $path = $file->store("konten/{$konten->id}/surat-pernyataan", 'public');
        $konten->update(['surat_pernyataan_url' => Storage::url($path)]);
    }

    /**
     * Jadikan satu file sebagai primary, unset yang lain.
     * Otomatis sync cover_url di konten.
     */
    public function setPrimary(MediaFile $media): void
    {
        MediaFile::where('konten_id', $media->konten_id)
                 ->update(['is_primary' => false]);

        $media->update(['is_primary' => true]);

        // cover_url hanya diperbarui jika file yang dijadikan primary adalah gambar
        if ($media->tipe === 'image') {
            $media->konten->update(['cover_url' => Storage::url($media->url)]);
        }
    }

    /**
     * Hapus file dari storage dan hapus record-nya.
     * Jika file yang dihapus adalah primary, auto-assign primary ke file berikutnya.
     */
    public function deleteFile(MediaFile $media): void
    {
        $wasPrimary = $media->is_primary;
        $kontenId   = $media->konten_id;

        Storage::disk('public')->delete($media->url);

        if ($media->thumbnail_url) {
            Storage::disk('public')->delete($media->thumbnail_url);
        }

        $media->delete();

        // Jika file ini primary, pindahkan primary ke file lain
        if ($wasPrimary) {
            $next = MediaFile::where('konten_id', $kontenId)->orderBy('urutan')->first();

            if ($next) {
                $this->setPrimary($next);
            } else {
                KontenBudaya::find($kontenId)?->update(['cover_url' => null]);
            }
        }
    }

    // -------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------

    private function detectType(string $mimeType): string
    {
        return match (true) {
            str_starts_with($mimeType, 'image/') => 'image',
            str_starts_with($mimeType, 'video/') => 'video',
            str_starts_with($mimeType, 'audio/') => 'audio',
            default                               => 'document',
        };
    }
}
