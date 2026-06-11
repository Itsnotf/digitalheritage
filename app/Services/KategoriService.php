<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class KategoriService
{
    public function getAll(?string $search): LengthAwarePaginator
    {
        return Category::with('parent')
            ->withCount('kontenBudayas')
            ->when($search, fn($q) => $q->where('nama', 'like', "%{$search}%"))
            ->orderBy('urutan')
            ->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    /**
     * Ambil hanya kategori root (parent_id = null) beserta anak-anaknya.
     * Dipakai di form select upload konten.
     */
    public function getRootWithChildren(): Collection
    {
        return Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('urutan')
            ->get();
    }

    /**
     * Semua kategori flat — untuk dropdown di form.
     */
    public function getForSelect(): Collection
    {
        return Category::orderBy('urutan')->get();
    }

    public function findById(int $id): Category
    {
        return Category::with(['parent', 'children'])->findOrFail($id);
    }

    public function create(array $data): Category
    {
        return Category::create([
            'nama'      => $data['nama'],
            'slug'      => Str::slug($data['nama']),
            'deskripsi' => $data['deskripsi'] ?? null,
            'icon'      => $data['icon'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
            'urutan'    => $data['urutan'] ?? 0,
        ]);
    }

    public function update(int $id, array $data): Category
    {
        $kategori = $this->findById($id);

        $kategori->update([
            'nama'      => $data['nama'],
            'slug'      => Str::slug($data['nama']),
            'deskripsi' => $data['deskripsi'] ?? null,
            'icon'      => $data['icon'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
            'urutan'    => $data['urutan'] ?? $kategori->urutan,
        ]);

        return $kategori;
    }

    public function delete(int $id): void
    {
        $this->findById($id)->delete();
    }
}
