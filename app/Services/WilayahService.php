<?php

namespace App\Services;

use App\Models\Wilayah;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class WilayahService
{
    public function getAll(?string $search): LengthAwarePaginator
    {
        return Wilayah::withCount('kontenBudayas')
            ->when($search, fn($q) => $q->where('nama', 'like', "%{$search}%"))
            ->orderBy('tipe')
            ->orderBy('nama')
            ->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    /**
     * Semua wilayah untuk dropdown di form.
     */
    public function getForSelect(): Collection
    {
        return Wilayah::orderBy('tipe')->orderBy('nama')->get();
    }

    public function findById(int $id): Wilayah
    {
        return Wilayah::findOrFail($id);
    }

    public function create(array $data): Wilayah
    {
        return Wilayah::create([
            'nama' => $data['nama'],
            'tipe' => $data['tipe'],
        ]);
    }

    public function update(int $id, array $data): Wilayah
    {
        $wilayah = $this->findById($id);
        $wilayah->update([
            'nama' => $data['nama'],
            'tipe' => $data['tipe'],
        ]);

        return $wilayah;
    }

    public function delete(int $id): void
    {
        $this->findById($id)->delete();
    }
}
