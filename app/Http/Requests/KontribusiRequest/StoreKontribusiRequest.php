<?php

namespace App\Http\Requests\KontribusiRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreKontribusiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Metadata konten
            'judul'       => ['required', 'string', 'max:255'],
            'deskripsi'   => ['required', 'string', 'min:50'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'wilayah_id'  => ['required', 'integer', 'exists:wilayah,id'],
            'tags'        => ['nullable', 'array', 'max:10'],
            'tags.*'      => ['string', 'max:50'],

            // Gambar cover khusus (opsional) — hanya berlaku untuk konten audio/video
            'cover_image' => ['nullable', 'image', 'max:5120'],

            // File media — wajib upload minimal 1 file
            'files'       => ['required', 'array', 'min:1', 'max:10'],
            'files.*'     => [
                'required',
                'file',
                'max:204800',  // 200MB max per file
                'mimes:jpeg,jpg,png,webp,gif,mp4,webm,mov,mp3,wav,ogg,m4a,pdf',
            ],

            // Surat pernyataan yang sudah diisi & discan — wajib di submission baru
            'surat_pernyataan' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required'       => 'Judul konten wajib diisi.',
            'deskripsi.required'   => 'Deskripsi wajib diisi.',
            'deskripsi.min'        => 'Deskripsi minimal 50 karakter.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak valid.',
            'wilayah_id.required'  => 'Wilayah wajib dipilih.',
            'wilayah_id.exists'    => 'Wilayah tidak valid.',
            'files.required'       => 'Minimal 1 file media wajib diunggah.',
            'files.min'            => 'Minimal 1 file media wajib diunggah.',
            'files.max'            => 'Maksimal 10 file per konten.',
            'files.*.max'          => 'Ukuran file maksimal 200MB.',
            'files.*.mimes'        => 'Format file tidak didukung. Format yang diterima: gambar (JPG, PNG, WEBP, GIF), video (MP4, WEBM, MOV), audio (MP3, WAV, OGG, M4A), dokumen (PDF).',
            'surat_pernyataan.required' => 'Surat pernyataan yang sudah diisi & discan wajib diunggah.',
            'surat_pernyataan.mimes'    => 'Format surat pernyataan harus PDF, JPG, atau PNG.',
            'surat_pernyataan.max'      => 'Ukuran surat pernyataan maksimal 10MB.',
        ];
    }
}
