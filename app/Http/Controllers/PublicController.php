<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\KontenBudaya;
use App\Models\SitePage;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function welcome(Request $request)
    {
        $tipe = $request->tipe;

        return inertia('welcome', [
            'konten' => KontenBudaya::published()
                ->with(['category', 'wilayah', 'primaryMedia', 'firstVideo', 'user'])
                ->withCount('ratings')
                ->withAvg('ratings', 'skor')
                ->when($tipe, fn($q) => $q->whereHas('mediaFiles', fn($m) => $m->where('tipe', $tipe)))
                ->latest('approved_at')
                ->paginate(24)
                ->withQueryString(),

            'kategoris' => Category::withCount(['kontenBudayas' => fn($q) => $q->published()])
                ->whereNull('parent_id')->orderBy('urutan')->get(),

            'filters' => $request->only('tipe'),
        ]);
    }

    public function galeri(Request $request)
    {
        $tipe = $request->tipe;

        return inertia('galeri/index', [
            'konten' => KontenBudaya::published()
                ->with(['category', 'wilayah', 'primaryMedia', 'firstVideo', 'user'])
                ->withCount('ratings')
                ->withAvg('ratings', 'skor')
                ->when($request->search,      fn($q) => $q->where('judul', 'like', "%{$request->search}%"))
                ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
                ->when($request->wilayah_id,  fn($q) => $q->where('wilayah_id', $request->wilayah_id))
                ->when($tipe, fn($q) => $q->whereHas('mediaFiles', fn($m) => $m->where('tipe', $tipe)))
                ->when($request->sort === 'popular', fn($q) => $q->orderByDesc('view_count'))
                ->when($request->sort !== 'popular', fn($q) => $q->latest('approved_at'))
                ->paginate(24)
                ->withQueryString(),

            'kategoris' => Category::whereNull('parent_id')->orderBy('urutan')->get(),
            'wilayahs'  => Wilayah::orderBy('nama')->get(),
            'filters'   => $request->only('search', 'category_id', 'wilayah_id', 'sort', 'tipe'),
        ]);
    }

    public function show(KontenBudaya $konten)
    {
        abort_if($konten->status !== 'published', 404);

        $konten->incrementView();

        return inertia('galeri/show', [
            'konten' => $konten->load([
                'user', 'category', 'wilayah', 'mediaFiles', 'tags',
                'comments.user', 'comments.replies.user',
            ])->loadCount('ratings')->loadAvg('ratings', 'skor'),

            'relatedKonten' => KontenBudaya::published()
                ->where('category_id', $konten->category_id)
                ->where('id', '!=', $konten->id)
                ->with(['primaryMedia', 'firstVideo', 'wilayah', 'user', 'category'])
                ->withAvg('ratings', 'skor')
                ->take(4)
                ->get(),

            'userRating' => auth()->check()
                ? $konten->ratings()->where('user_id', auth()->id())->value('skor')
                : null,
        ]);
    }

    /** Halaman Tentang Kami */
    public function tentang()
    {
        $page = SitePage::forKey('tentang-kami');

        return inertia('tentang', [
            'page' => [
                ...$page->toArray(),
                'hero_image_url' => $page->hero_image_url,
            ],
        ]);
    }

    /** Halaman Kontak */
    public function kontak()
    {
        $page = SitePage::forKey('kontak');

        return inertia('kontak', [
            'page' => [
                ...$page->toArray(),
                'hero_image_url' => $page->hero_image_url,
            ],
        ]);
    }
}
