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
    public function welcome()
    {
        return inertia('welcome', [
            'featured'  => KontenBudaya::published()
                ->with(['category', 'wilayah', 'primaryMedia', 'user'])
                ->withCount('ratings')
                ->withAvg('ratings', 'skor')
                ->latest('approved_at')
                ->take(6)
                ->get(),

            'kategoris' => Category::withCount([
                    'kontenBudayas' => fn($q) => $q->published(),
                ])
                ->whereNull('parent_id')
                ->orderBy('urutan')
                ->get(),

            'stats' => [
                'total_konten'      => KontenBudaya::published()->count(),
                'total_kontributor' => User::whereHas('kontenBudayas', fn($q) => $q->published())->count(),
                'total_wilayah'     => Wilayah::whereHas('kontenBudayas', fn($q) => $q->published())->count(),
            ],

            // Hero image dari CMS
            'berandaPage' => SitePage::forKey('beranda')->only(['hero_image_url', 'content']),
        ]);
    }

    public function galeri(Request $request)
    {
        // 'video' adalah mode default — hanya tampilkan konten yang punya file video
        // 'galeri' — tampilkan semua tipe konten
        $mode = $request->mode === 'galeri' ? 'galeri' : 'video';

        $query = KontenBudaya::published()
            ->with(['category', 'wilayah', 'primaryMedia', 'user'])
            ->withCount('ratings')
            ->withAvg('ratings', 'skor')
            ->when($request->search,      fn($q) => $q->where('judul', 'like', "%{$request->search}%"))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->wilayah_id,  fn($q) => $q->where('wilayah_id', $request->wilayah_id))
            ->when($request->sort === 'popular', fn($q) => $q->orderByDesc('view_count'))
            ->when($request->sort !== 'popular', fn($q) => $q->latest('approved_at'));

        // Mode video: filter hanya konten yang memiliki minimal 1 file video
        // dan load firstVideo untuk menampilkan durasi di card
        if ($mode === 'video') {
            $query
                ->whereHas('mediaFiles', fn($q) => $q->where('tipe', 'video'))
                ->with(['firstVideo']);
        }

        return inertia('galeri/index', [
            'konten'     => $query->paginate(12)->withQueryString(),
            'kategoris'  => Category::whereNull('parent_id')->orderBy('urutan')->get(),
            'wilayahs'   => Wilayah::orderBy('nama')->get(),
            'filters'    => $request->only('search', 'category_id', 'wilayah_id', 'sort', 'mode'),
            'galeriPage' => SitePage::forKey('galeri')->only(['hero_image_url', 'content']),
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
                ->with(['primaryMedia', 'wilayah'])
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
