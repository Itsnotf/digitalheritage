<?php

namespace App\Http\Controllers;

use App\Http\Requests\KontribusiRequest\StoreKontribusiRequest;
use App\Http\Requests\KontribusiRequest\UpdateKontribusiRequest;
use App\Models\KontenBudaya;
use App\Models\MediaFile;
use App\Services\KategoriService;
use App\Services\KontenBudayaService;
use App\Services\MediaFileService;
use App\Services\WilayahService;
use Illuminate\Http\Request;
use Illuminate\Support\Number;

class KontribusiController extends Controller
{
    public function __construct(
        private KontenBudayaService $kontenService,
        private MediaFileService    $mediaService,
        private KategoriService     $kategoriService,
        private WilayahService      $wilayahService,
    ) {}

    /**
     * Daftar konten milik user yang sedang login.
     */
    public function index(Request $request)
    {
        return inertia('kontribusi/index', [
            'konten'  => $this->kontenService->getAllByUser(
                user: $request->user(),
                search: $request->search,
                status: $request->status,
            ),
            'filters' => $request->only('search', 'status'),
            'flash'   => ['success' => session('success')],
        ]);
    }

    /**
     * Form upload konten baru.
     */
    public function create()
    {
        return inertia('kontribusi/create', [
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
        ]);
    }

    /**
     * Simpan konten baru + upload file.
     */
    public function store(StoreKontribusiRequest $request)
    {
        $konten = $this->kontenService->create($request->validated(), $request->user());


        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($konten, $request->file('files'));
        }

        return redirect()
            ->route('kontribusi.show', $konten)
            ->with('success', 'Konten berhasil dikirim dan sedang menunggu review admin.');
    }

    /**
     * Detail konten milik user — tampilkan status, riwayat moderasi, dan file.
     */
    public function show(int $id)
    {

        $konten = $this->kontenService->findById($id);

        $this->authorizeOwner($id);

        return inertia('kontribusi/show', [
            'konten' => $this->kontenService->findById($konten->id),
        ]);
    }

    /**
     * Form edit konten (hanya bisa jika status pending atau rejected).
     */
    public function edit(int $id)
    {
        $konten = $this->kontenService->findById($id);

        $this->authorizeOwner($id);
        abort_if($konten->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        return inertia('kontribusi/edit', [
            'konten'    => $this->kontenService->findById($konten->id),
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
        ]);
    }

    /**
     * Update konten + tambah/hapus file + ubah primary.
     * Jika sebelumnya rejected → otomatis kembali ke pending (resubmit).
     */
    public function update(UpdateKontribusiRequest $request, int $id)
    {
        $konten = $this->kontenService->findById($id);

        $this->authorizeOwner($id);
        abort_if($konten->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        $this->kontenService->update($konten, $request->validated());

        // Hapus file yang dipilih user untuk dihapus
        if ($request->has('delete_media')) {
            foreach ($request->delete_media as $mediaId) {
                $media = MediaFile::where('id', $mediaId)
                                  ->where('konten_id', $konten->id)
                                  ->first();
                if ($media) {
                    $this->mediaService->deleteFile($media);
                }
            }
        }

        // Ubah primary jika user memilih file lain
        if ($request->filled('primary_media')) {
            $media = MediaFile::where('id', $request->primary_media)
                              ->where('konten_id', $konten->id)
                              ->firstOrFail();
            $this->mediaService->setPrimary($media);
        }

        // Upload file baru jika ada
        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($konten, $request->file('files'));
        }

        $message = $konten->wasChanged('status')
            ? 'Konten berhasil diperbarui dan dikirim ulang untuk review admin.'
            : 'Konten berhasil diperbarui.';

        return redirect()
            ->route('kontribusi.show', $konten)
            ->with('success', $message);
    }

    /**
     * Hapus konten (hanya jika bukan published).
     */
    public function destroy(int $id)
    {
        $konten = $this->kontenService->findById($id);

        $this->authorizeOwner($id);
        abort_if($konten->status === 'published', 403, 'Konten yang sudah tayang tidak bisa dihapus langsung. Hubungi admin.');

        $this->kontenService->delete($konten);

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten berhasil dihapus.');
    }

    /**
     * User memilih untuk merevisi konten yang ditolak → diarahkan ke form edit.
     */
    public function respondRevise(int $id)
    {
        $konten = $this->kontenService->findById($id);

        $this->authorizeOwner($id);
        abort_if($konten->status !== 'rejected', 403);

        $this->kontenService->respondRevise($konten, request()->user());

        return redirect()
            ->route('kontribusi.edit', $konten)
            ->with('success', 'Silakan perbaiki konten sesuai catatan admin, lalu simpan.');
    }

    /**
     * User memilih untuk tidak merevisi — penolakan menjadi final.
     */
    public function respondDecline(int $id)
    {
        $konten = $this->kontenService->findById($id);

        $this->authorizeOwner($id);
        abort_if($konten->status !== 'rejected', 403);

        $this->kontenService->respondDecline($konten, request()->user());

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten ditandai sebagai ditolak final.');
    }

    // -------------------------------------------------------
    // Private
    // -------------------------------------------------------

    private function authorizeOwner(int $id): void
    {
        $konten = $this->kontenService->findById($id);

        abort_if($konten->user_id !== request()->user()->id, 403);
    }
}
