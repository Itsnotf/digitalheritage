<?php

namespace App\Http\Controllers;

use App\Models\SuratPernyataan;
use App\Services\SuratPernyataanService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SuratPernyataanController extends Controller implements HasMiddleware
{
    public function __construct(private SuratPernyataanService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:surat pernyataan edit'),
        ];
    }

    public function edit()
    {
        $surat = SuratPernyataan::current();

        return inertia('surat-pernyataan/edit', [
            'surat' => [
                'filename'   => $surat->filename,
                'ukuran_kb'  => $surat->ukuran_kb,
                'file_url'   => $surat->file_url,
                'updated_at' => $surat->updated_at,
            ],
            'flash' => ['success' => session('success')],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ], [
            'file.required' => 'Pilih file PDF terlebih dahulu.',
            'file.mimes'    => 'Template surat pernyataan harus berformat PDF.',
            'file.max'      => 'Ukuran file maksimal 5MB.',
        ]);

        $this->service->upload($request->file('file'), (int) $request->user()->id);

        return redirect()
            ->route('surat-pernyataan.edit')
            ->with('success', 'Template surat pernyataan berhasil diperbarui.');
    }
}
