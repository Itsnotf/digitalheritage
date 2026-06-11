<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Services\KomentarService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class KomentarController extends Controller implements HasMiddleware
{
    public function __construct(private KomentarService $komentarService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:komentar index',  only: ['index']),
            new Middleware('permission:komentar delete', only: ['hide', 'destroy']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('komentar/index', [
            'komentar' => $this->komentarService->getAll($request->search, $request->status),
            'filters'  => $request->only('search', 'status'),
            'flash'    => ['success' => session('success')],
        ]);
    }

    /**
     * Toggle sembunyikan / tampilkan komentar.
     */
    public function hide(int $id)
    {
        $comment = $this->komentarService->findById($id);
        $updated = $this->komentarService->toggleVisibility($comment);

        $message = $updated->status === 'tersembunyi'
            ? 'Komentar disembunyikan.'
            : 'Komentar ditampilkan kembali.';

        return redirect()
            ->back()
            ->with('success', $message);
    }

    public function destroy(int $id)
    {
        $comment = $this->komentarService->findById($id);
        $this->komentarService->delete($comment);

        return redirect()
            ->back()
            ->with('success', 'Komentar berhasil dihapus.');
    }
}
