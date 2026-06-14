<?php

namespace App\Http\Controllers;

use App\Http\Requests\KontenRequest\RejectKontenRequest;
use App\Models\KontenBudaya;
use App\Services\KategoriService;
use App\Services\KontenBudayaService;
use App\Services\WilayahService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class KontenBudayaController extends Controller implements HasMiddleware
{
    public function __construct(
        private KontenBudayaService $kontenService,
        private KategoriService     $kategoriService,
        private WilayahService      $wilayahService,
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:konten index',    only: ['index', 'show']),
            new Middleware('permission:konten validate', only: ['approve', 'reject']),
            new Middleware('permission:konten delete',   only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('konten/index', [
            'konten'    => $this->kontenService->getAllForAdmin(
                search:     $request->search,
                status:     $request->status,
                categoryId: $request->category_id,
                wilayahId:  $request->wilayah_id,
            ),
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
            'filters'   => $request->only('search', 'status', 'category_id', 'wilayah_id'),
            'flash'     => ['success' => session('success')],
        ]);
    }

    // Route model binding — Laravel otomatis cari KontenBudaya berdasarkan slug
    public function show(KontenBudaya $konten)
    {
        $konten->load([
            'user', 'category', 'wilayah', 'mediaFiles', 'tags', 'moderationLogs.user',
        ]);

        return inertia('konten/show', [
            'konten' => $konten,
        ]);
    }

    public function approve(Request $request, KontenBudaya $konten)
    {
        abort_if($konten->status === 'published', 422, 'Konten sudah tayang.');

        $this->kontenService->approve($konten, $request->user());

        return redirect()
            ->route('konten.show', $konten)
            ->with('success', 'Konten berhasil disetujui dan sekarang tayang.');
    }

    public function reject(RejectKontenRequest $request, KontenBudaya $konten)
    {
        abort_if($konten->status === 'published', 422, 'Konten sudah tayang, tidak bisa ditolak langsung.');

        $this->kontenService->reject($konten, $request->user(), $request->catatan);

        return redirect()
            ->route('konten.show', $konten)
            ->with('success', 'Konten ditolak. Pengguna akan menerima notifikasi beserta alasan penolakan.');
    }

    public function destroy(KontenBudaya $konten)
    {
        $this->kontenService->delete($konten);

        return redirect()
            ->route('konten.index')
            ->with('success', 'Konten berhasil dihapus.');
    }
}
