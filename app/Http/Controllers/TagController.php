<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;

class TagController extends Controller implements HasMiddleware
{
    public function __construct(private TagService $tagService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:tag index',  only: ['index']),
            new Middleware('permission:tag create', only: ['create', 'store']),
            new Middleware('permission:tag edit',   only: ['edit', 'update']),
            new Middleware('permission:tag delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('tag/index', [
            'tags'    => $this->tagService->getAll($request->search),
            'filters' => $request->only('search'),
            'flash'   => ['success' => session('success')],
        ]);
    }

    public function create()
    {
        return inertia('tag/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:50', 'unique:tags,nama'],
        ]);

        $this->tagService->create($data);

        return redirect()
            ->route('tag.index')
            ->with('success', 'Tag berhasil ditambahkan.');
    }

    public function edit(Tag $tag)
    {
        return inertia('tag/edit', ['tag' => $tag]);
    }

    public function update(Request $request, Tag $tag)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:50', Rule::unique('tags', 'nama')->ignore($tag->id)],
        ]);

        $this->tagService->update($tag->id, $data);

        return redirect()
            ->route('tag.index')
            ->with('success', 'Tag berhasil diperbarui.');
    }

    public function destroy(Tag $tag)
    {
        $this->tagService->delete($tag->id);

        return redirect()
            ->route('tag.index')
            ->with('success', 'Tag berhasil dihapus.');
    }
}
