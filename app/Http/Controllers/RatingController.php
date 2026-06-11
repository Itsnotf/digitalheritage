<?php

namespace App\Http\Controllers;

use App\Models\KontenBudaya;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingController extends Controller
{
    /**
     * Simpan atau update rating.
     * Satu user hanya bisa rating sekali — updateOrCreate untuk mengubah.
     */
    public function store(Request $request, int $id)
    {
        $konten = KontenBudaya::findOrFail($id);

        abort_if($konten->status !== 'published', 403);
        abort_if($konten->user_id === Auth::id(), 403, 'Tidak bisa memberi rating pada konten milik sendiri.');

        $request->validate([
            'skor' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        Rating::updateOrCreate(
            [
                'konten_id' => $konten->id,
                'user_id'   => Auth::id(),
            ],
            ['skor' => $request->skor]
        );

        return back();
    }
}
