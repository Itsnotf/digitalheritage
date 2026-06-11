<?php

namespace App\Services;

use App\Models\SitePage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SitePageService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return SitePage::orderBy('key')->get();
    }

    public function findByKey(string $key): SitePage
    {
        return SitePage::where('key', $key)->firstOrFail();
    }

    /**
     * Update metadata dan konten halaman.
     */
    public function updateContent(SitePage $page, array $data): SitePage
    {
        $page->update([
            'title'    => $data['title']    ?? $page->title,
            'subtitle' => $data['subtitle'] ?? $page->subtitle,
            'content'  => $data['content']  ?? $page->content,
        ]);

        return $page->fresh();
    }

    /**
     * Ganti hero image — hapus file lama, simpan yang baru.
     */
    public function uploadHero(SitePage $page, UploadedFile $file): SitePage
    {
        if ($page->hero_image) {
            Storage::disk('public')->delete($page->hero_image);
        }

        $path = $file->store('pages/' . $page->key, 'public');

        $page->update(['hero_image' => $path]);

        return $page->fresh();
    }

    /**
     * Hapus hero image tanpa menggantinya.
     */
    public function removeHero(SitePage $page): SitePage
    {
        if ($page->hero_image) {
            Storage::disk('public')->delete($page->hero_image);
        }

        $page->update(['hero_image' => null]);

        return $page->fresh();
    }
}
