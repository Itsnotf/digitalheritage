<?php

namespace App\Http\Controllers;

use App\Http\Requests\KontribusiRequest\StoreKontribusiRequest;
use App\Http\Requests\KontribusiRequest\UpdateKontribusiRequest;
use App\Models\KontenBudaya;
use App\Models\MediaFile;
use App\Models\SuratPernyataan;
use App\Services\KategoriService;
use App\Services\KontenBudayaService;
use App\Services\MediaFileService;
use App\Services\WilayahService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KontribusiController extends Controller
{
    public function __construct(
        private KontenBudayaService $kontenService,
        private MediaFileService    $mediaService,
        private KategoriService     $kategoriService,
        private WilayahService      $wilayahService,
    ) {}

    public function index(Request $request)
    {
        return inertia('kontribusi/index', [
            'konten'  => $this->kontenService->getAllByUser(
                user:   $request->user(),
                search: $request->search,
                status: $request->status,
            ),
            'filters' => $request->only('search', 'status'),
            'flash'   => ['success' => session('success')],
        ]);
    }

    public function create()
    {
        return inertia('kontribusi/create', [
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
            'suratPernyataanAvailable' => (bool) SuratPernyataan::current()->file_path,
        ]);
    }

    /** Kontributor download template surat pernyataan kosong sebelum mengisi & scan ulang. */
    public function downloadSurat()
    {
        $surat = SuratPernyataan::current();

        abort_if(!$surat->file_path, 404, 'Surat pernyataan belum tersedia. Hubungi admin.');

        return Storage::disk('public')->download($surat->file_path, $surat->filename);
    }

    public function store(StoreKontribusiRequest $request)
    {
        $konten = $this->kontenService->create($request->validated(), $request->user());

        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($konten, $request->file('files'));
        }

        // Cover khusus (opsional, override cover dari media files)
        if ($request->hasFile('cover_image')) {
            $this->mediaService->storeCoverImage($konten, $request->file('cover_image'));
        }

        // Surat pernyataan yang sudah diisi & discan — wajib di submission baru
        if ($request->hasFile('surat_pernyataan')) {
            $this->mediaService->storeSuratPernyataan($konten, $request->file('surat_pernyataan'));
        }

        return redirect()
            ->route('kontribusi.show', $konten)
            ->with('success', 'Konten berhasil dikirim dan sedang menunggu review admin.');
    }

    // Route model binding — parameter name harus cocok dengan {kontribusi} di route resource
    public function show(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);

        $kontribusi->load([
            'user', 'category', 'wilayah', 'mediaFiles', 'tags', 'moderationLogs.user',
        ]);

        return inertia('kontribusi/show', [
            'konten' => $kontribusi,
        ]);
    }

    public function edit(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        $kontribusi->load(['mediaFiles', 'tags', 'category', 'wilayah']);

        return inertia('kontribusi/edit', [
            'konten'    => $kontribusi,
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
        ]);
    }

    public function update(UpdateKontribusiRequest $request, KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        $this->kontenService->update($kontribusi, $request->validated());

        if ($request->has('delete_media')) {
            foreach ($request->delete_media as $mediaId) {
                $media = MediaFile::where('id', $mediaId)
                                  ->where('konten_id', $kontribusi->id)
                                  ->first();
                if ($media) {
                    $this->mediaService->deleteFile($media);
                }
            }
        }

        if ($request->filled('primary_media')) {
            $media = MediaFile::where('id', $request->primary_media)
                              ->where('konten_id', $kontribusi->id)
                              ->firstOrFail();
            $this->mediaService->setPrimary($media);
        }

        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($kontribusi, $request->file('files'));
        }

        if ($request->hasFile('cover_image')) {
            $this->mediaService->storeCoverImage($kontribusi, $request->file('cover_image'));
        }

        // Opsional saat edit — kalau ditolak & kirim ulang, file lama tetap dipakai
        // kecuali kontributor sengaja unggah ulang.
        if ($request->hasFile('surat_pernyataan')) {
            $this->mediaService->storeSuratPernyataan($kontribusi, $request->file('surat_pernyataan'));
        }

        $message = $kontribusi->wasChanged('status')
            ? 'Konten berhasil diperbarui dan dikirim ulang untuk review admin.'
            : 'Konten berhasil diperbarui.';

        return redirect()
            ->route('kontribusi.show', $kontribusi)
            ->with('success', $message);
    }

    public function destroy(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa dihapus langsung. Hubungi admin.');

        $this->kontenService->delete($kontribusi);

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten berhasil dihapus.');
    }

    // Parameter {kontribusi} di route revise/decline harus cocok dengan nama ini
    public function respondRevise(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status !== 'rejected', 403);

        $this->kontenService->respondRevise($kontribusi, request()->user());

        return redirect()
            ->route('kontribusi.edit', $kontribusi)
            ->with('success', 'Silakan perbaiki konten sesuai catatan admin, lalu simpan.');
    }

    public function respondDecline(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status !== 'rejected', 403);

        $this->kontenService->respondDecline($kontribusi, request()->user());

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten ditandai sebagai ditolak final.');
    }

    // (int) cast mencegah strict !== mismatch antar environment database driver
    private function authorizeOwner(KontenBudaya $konten): void
    {
        abort_if((int) $konten->user_id !== (int) auth()->id(), 403);
    }
}
