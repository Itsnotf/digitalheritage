<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\KontenBudaya;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PublicKomentarController extends Controller
{
    public function store(Request $request, KontenBudaya $konten)
    {
        abort_if($konten->status !== 'published', 403);

        $request->validate([
            'isi'       => ['required', 'string', 'min:3', 'max:1000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ]);

        Comment::create([
            'konten_id' => $konten->id,
            'user_id'   => Auth::id(),
            'parent_id' => $request->parent_id,
            'isi'       => $request->isi,
            'status'    => 'aktif',
        ]);

        return back();
    }
}
