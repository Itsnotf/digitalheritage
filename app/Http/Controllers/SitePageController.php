<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use App\Services\SitePageService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SitePageController extends Controller implements HasMiddleware
{
    public function __construct(private SitePageService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:halaman index', only: ['index']),
            new Middleware('permission:halaman edit',  only: ['edit', 'update', 'uploadHero', 'removeHero']),
        ];
    }

    /** Daftar semua halaman yang bisa dikelola */
    public function index()
    {
        return inertia('page-manager/index', [
            'pages' => $this->service->getAll()->map(fn($p) => [
                ...$p->toArray(),
                'hero_image_url' => $p->hero_image_url,
            ]),
            'flash' => ['success' => session('success')],
        ]);
    }

    /** Form edit konten halaman */
    public function edit(SitePage $page)
    {
        return inertia('page-manager/edit', [
            'page' => [
                ...$page->toArray(),
                'hero_image_url' => $page->hero_image_url,
            ],
        ]);
    }

    /** Simpan konten halaman */
    public function update(Request $request, SitePage $page)
    {
        $request->validate([
            'title'    => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'content'  => ['nullable', 'array'],
        ]);

        $this->service->updateContent($page, $request->only('title', 'subtitle', 'content'));

        return redirect()
            ->route('halaman.edit', $page)
            ->with('success', 'Konten halaman berhasil disimpan.');
    }

    /** Upload atau ganti hero image */
    public function uploadHero(Request $request, SitePage $page)
    {
        $request->validate([
            'hero_image' => ['required', 'image', 'max:5120', 'mimes:jpeg,jpg,png,webp'],
        ]);

        $this->service->uploadHero($page, $request->file('hero_image'));

        return redirect()
            ->route('halaman.edit', $page)
            ->with('success', 'Hero image berhasil diperbarui.');
    }

    /** Hapus hero image */
    public function removeHero(SitePage $page)
    {
        $this->service->removeHero($page);

        return redirect()
            ->route('halaman.edit', $page)
            ->with('success', 'Hero image berhasil dihapus.');
    }
}
