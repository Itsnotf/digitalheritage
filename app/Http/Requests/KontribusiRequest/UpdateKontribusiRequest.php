<?php

namespace App\Http\Requests\KontribusiRequest;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKontribusiRequest extends FormRequest
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

            // File tambahan — opsional saat update
            'files'       => ['nullable', 'array', 'max:10'],
            'files.*'     => [
                'file',
                'max:204800',
                'mimes:jpeg,jpg,png,webp,gif,mp4,webm,mov,mp3,wav,ogg,m4a,pdf',
            ],

            // ID media yang ingin dihapus
            'delete_media'   => ['nullable', 'array'],
            'delete_media.*' => ['integer', 'exists:media_files,id'],

            // ID media yang ingin dijadikan primary
            'primary_media'  => ['nullable', 'integer', 'exists:media_files,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required'       => 'Judul konten wajib diisi.',
            'deskripsi.required'   => 'Deskripsi wajib diisi.',
            'deskripsi.min'        => 'Deskripsi minimal 50 karakter.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'wilayah_id.required'  => 'Wilayah wajib dipilih.',
            'files.max'            => 'Maksimal 10 file tambahan.',
            'files.*.max'          => 'Ukuran file maksimal 200MB.',
            'files.*.mimes'        => 'Format file tidak didukung.',
        ];
    }
}
