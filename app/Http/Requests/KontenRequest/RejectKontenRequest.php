<?php

namespace App\Http\Requests\KontenRequest;

use Illuminate\Foundation\Http\FormRequest;

class RejectKontenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'catatan' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'catatan.required' => 'Alasan penolakan wajib diisi.',
            'catatan.min'      => 'Alasan penolakan minimal 10 karakter.',
            'catatan.max'      => 'Alasan penolakan maksimal 1000 karakter.',
        ];
    }
}
