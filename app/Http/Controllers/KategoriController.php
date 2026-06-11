<?php

namespace App\Http\Controllers;

use App\Http\Requests\KategoriRequest\StoreKategoriRequest;
use App\Http\Requests\KategoriRequest\UpdateKategoriRequest;
use App\Models\Category;
use App\Services\KategoriService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class KategoriController extends Controller implements HasMiddleware
{
    public function __construct(private KategoriService $kategoriService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:kategori index',  only: ['index']),
            new Middleware('permission:kategori create', only: ['create', 'store']),
            new Middleware('permission:kategori edit',   only: ['edit', 'update']),
            new Middleware('permission:kategori delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('kategori/index', [
            'kategoris' => $this->kategoriService->getAll($request->search),
            'filters'   => $request->only('search'),
            'flash'     => ['success' => session('success')],
        ]);
    }

    public function create()
    {
        return inertia('kategori/create', [
            'parentOptions' => $this->kategoriService->getRootWithChildren(),
        ]);
    }

    public function store(StoreKategoriRequest $request)
    {
        $this->kategoriService->create($request->validated());

        return redirect()
            ->route('kategori.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit(Category $kategori)
    {
        return inertia('kategori/edit', [
            'kategori'      => $this->kategoriService->findById($kategori->id),
            'parentOptions' => $this->kategoriService->getRootWithChildren(),
        ]);
    }

    public function update(UpdateKategoriRequest $request, Category $kategori)
    {
        $this->kategoriService->update($kategori->id, $request->validated());

        return redirect()
            ->route('kategori.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $kategori)
    {
        $this->kategoriService->delete($kategori->id);

        return redirect()
            ->route('kategori.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}
