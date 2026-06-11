<?php

namespace App\Http\Controllers;

use App\Models\Wilayah;
use App\Services\WilayahService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;

class WilayahController extends Controller implements HasMiddleware
{
    public function __construct(private WilayahService $wilayahService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:wilayah index',  only: ['index']),
            new Middleware('permission:wilayah create', only: ['create', 'store']),
            new Middleware('permission:wilayah edit',   only: ['edit', 'update']),
            new Middleware('permission:wilayah delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('wilayah/index', [
            'wilayahs' => $this->wilayahService->getAll($request->search),
            'filters'  => $request->only('search'),
            'flash'    => ['success' => session('success')],
        ]);
    }

    public function create()
    {
        return inertia('wilayah/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100', 'unique:wilayah,nama'],
            'tipe' => ['required', Rule::in(['kota', 'kabupaten'])],
        ]);

        $this->wilayahService->create($data);

        return redirect()
            ->route('wilayah.index')
            ->with('success', 'Wilayah berhasil ditambahkan.');
    }

    public function edit(Wilayah $wilayah)
    {
        return inertia('wilayah/edit', [
            'wilayah' => $this->wilayahService->findById($wilayah->id),
        ]);
    }

    public function update(Request $request, Wilayah $wilayah)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100', Rule::unique('wilayah', 'nama')->ignore($wilayah->id)],
            'tipe' => ['required', Rule::in(['kota', 'kabupaten'])],
        ]);

        $this->wilayahService->update($wilayah->id, $data);

        return redirect()
            ->route('wilayah.index')
            ->with('success', 'Wilayah berhasil diperbarui.');
    }

    public function destroy(Wilayah $wilayah)
    {
        $this->wilayahService->delete($wilayah->id);

        return redirect()
            ->route('wilayah.index')
            ->with('success', 'Wilayah berhasil dihapus.');
    }
}
