<?php

namespace App\Services;

use App\Models\SuratPernyataan;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SuratPernyataanService
{
    /** Ganti template surat pernyataan (hapus file lama, simpan yang baru). */
    public function upload(UploadedFile $file, int $adminId): SuratPernyataan
    {
        $surat = SuratPernyataan::current();

        if ($surat->file_path) {
            Storage::disk('public')->delete($surat->file_path);
        }

        $path = $file->store('surat-pernyataan', 'public');

        $surat->update([
            'file_path'   => $path,
            'filename'    => $file->getClientOriginalName(),
            'ukuran_kb'   => (int) ceil($file->getSize() / 1024),
            'uploaded_by' => $adminId,
        ]);

        return $surat;
    }
}
