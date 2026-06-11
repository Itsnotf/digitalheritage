<?php

namespace App\Http\Requests\KategoriRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKategoriRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('kategori');

        return [
            'nama'      => ['required', 'string', 'max:100', Rule::unique('categories', 'nama')->ignore($id)],
            'deskripsi' => ['nullable', 'string', 'max:500'],
            'icon'      => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id', Rule::notIn([$id])],
            'urutan'    => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'        => 'Nama kategori wajib diisi.',
            'nama.unique'          => 'Nama kategori sudah digunakan.',
            'parent_id.not_in'     => 'Kategori tidak bisa menjadi induk dirinya sendiri.',
        ];
    }
}
