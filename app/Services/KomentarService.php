<?php

namespace App\Services;

use App\Models\Comment;
use Illuminate\Pagination\LengthAwarePaginator;

class KomentarService
{
    public function getAll(?string $search, ?string $status): LengthAwarePaginator
    {
        return Comment::with(['user', 'konten'])
            ->when($search, fn($q) => $q->where('isi', 'like', "%{$search}%"))
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    public function findById(int $id): Comment
    {
        return Comment::findOrFail($id);
    }

    /**
     * Toggle visibility komentar (aktif ↔ tersembunyi).
     */
    public function toggleVisibility(Comment $comment): Comment
    {
        $newStatus = $comment->status === 'aktif' ? 'tersembunyi' : 'aktif';
        $comment->update(['status' => $newStatus]);

        return $comment;
    }

    public function delete(Comment $comment): void
    {
        $comment->delete();
    }
}
