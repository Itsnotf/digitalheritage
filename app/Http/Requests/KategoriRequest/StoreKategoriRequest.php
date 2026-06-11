<?php

namespace App\Http\Requests\KategoriRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreKategoriRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama'      => ['required', 'string', 'max:100', 'unique:categories,nama'],
            'deskripsi' => ['nullable', 'string', 'max:500'],
            'icon'      => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'urutan'    => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama kategori wajib diisi.',
            'nama.unique'   => 'Nama kategori sudah digunakan.',
        ];
    }
}
