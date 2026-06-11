<?php

namespace App\Services;

use App\Models\Tag;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class TagService
{
    public function getAll(?string $search): LengthAwarePaginator
    {
        return Tag::withCount('kontenBudayas')
            ->when($search, fn($q) => $q->where('nama', 'like', "%{$search}%"))
            ->orderBy('nama')
            ->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    public function findById(int $id): Tag
    {
        return Tag::findOrFail($id);
    }

    public function create(array $data): Tag
    {
        return Tag::create([
            'nama' => $data['nama'],
            'slug' => Str::slug($data['nama']),
        ]);
    }

    public function update(int $id, array $data): Tag
    {
        $tag = $this->findById($id);
        $tag->update([
            'nama' => $data['nama'],
            'slug' => Str::slug($data['nama']),
        ]);

        return $tag;
    }

    public function delete(int $id): void
    {
        $this->findById($id)->delete();
    }
}
