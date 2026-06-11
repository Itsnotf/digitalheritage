<?php

namespace App\Services;

use App\Models\KontenBudaya;
use App\Models\ModerationLog;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class KontenBudayaService
{
    public function __construct(
        private MediaFileService $mediaFileService
    ) {}

    // =========================================================
    // ADMIN — moderasi & pengelolaan
    // =========================================================

    public function getAllForAdmin(
        ?string $search,
        ?string $status,
        ?int    $categoryId,
        ?int    $wilayahId
    ): LengthAwarePaginator {
        return KontenBudaya::with(['user', 'category', 'wilayah', 'primaryMedia'])
            ->when($search,     fn($q) => $q->where('judul', 'like', "%{$search}%"))
            ->when($status,     fn($q) => $q->where('status', $status))
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->when($wilayahId,  fn($q) => $q->where('wilayah_id', $wilayahId))
            ->latest()
            ->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    /**
     * Approve konten:
     * - Status → published
     * - Catat ke moderation_log
     * - Increment counter cache level user (approved_konten_count)
     */
    public function approve(KontenBudaya $konten, User $admin): void
    {
        $konten->update([
            'status'        => 'published',
            'catatan_admin' => null,
            'approved_by'   => $admin->id,
            'approved_at'   => now(),
        ]);

        ModerationLog::create([
            'konten_id' => $konten->id,
            'user_id'   => $admin->id,
            'aksi'      => 'approve',
        ]);

        // Increment counter cache untuk sistem level kontributor
        $konten->user()->increment('approved_konten_count');
    }

    /**
     * Reject konten — catatan admin wajib diisi.
     */
    public function reject(KontenBudaya $konten, User $admin, string $catatan): void
    {
        $konten->update([
            'status'        => 'rejected',
            'catatan_admin' => $catatan,
        ]);

        ModerationLog::create([
            'konten_id' => $konten->id,
            'user_id'   => $admin->id,
            'aksi'      => 'reject',
            'catatan'   => $catatan,
        ]);
    }

    // =========================================================
    // USER — kontribusi & pengelolaan konten milik sendiri
    // =========================================================

    public function getAllByUser(
        User    $user,
        ?string $search,
        ?string $status
    ): LengthAwarePaginator {
        return KontenBudaya::with(['category', 'wilayah', 'primaryMedia'])
            ->where('user_id', $user->id)
            ->when($search, fn($q) => $q->where('judul', 'like', "%{$search}%"))
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    public function create(array $data, User $user): KontenBudaya
    {
        $konten = KontenBudaya::create([
            'user_id'     => $user->id,
            'category_id' => $data['category_id'],
            'wilayah_id'  => $data['wilayah_id'],
            'judul'       => $data['judul'],
            'slug'        => $this->generateSlug($data['judul']),
            'deskripsi'   => $data['deskripsi'],
            'status'      => 'pending',
        ]);

        if (!empty($data['tags'])) {
            $this->syncTags($konten, $data['tags']);
        }

        return $konten;
    }

    /**
     * Update konten.
     * Jika sebelumnya rejected dan user submit ulang → otomatis kembali ke pending.
     */
    public function update(KontenBudaya $konten, array $data): KontenBudaya
    {
        $fields = [
            'category_id' => $data['category_id'],
            'wilayah_id'  => $data['wilayah_id'],
            'judul'       => $data['judul'],
            'deskripsi'   => $data['deskripsi'],
        ];

        if ($konten->status === 'rejected') {
            $fields['status']        = 'pending';
            $fields['catatan_admin'] = null;
        }

        $konten->update($fields);

        if (isset($data['tags'])) {
            $this->syncTags($konten, $data['tags']);
        }

        return $konten->fresh();
    }

    /**
     * User memilih revisi → catat ke log, status tetap rejected.
     * Status baru ke pending saat user submit form edit.
     */
    public function respondRevise(KontenBudaya $konten, User $user): void
    {
        ModerationLog::create([
            'konten_id' => $konten->id,
            'user_id'   => $user->id,
            'aksi'      => 'user_revise',
        ]);
    }

    /**
     * User memilih tidak merevisi → penolakan final.
     */
    public function respondDecline(KontenBudaya $konten, User $user): void
    {
        ModerationLog::create([
            'konten_id' => $konten->id,
            'user_id'   => $user->id,
            'aksi'      => 'user_decline',
        ]);
    }

    /**
     * Hapus konten beserta semua file fisiknya.
     */
    public function delete(KontenBudaya $konten): void
    {
        foreach ($konten->mediaFiles as $media) {
            $this->mediaFileService->deleteFile($media);
        }

        $konten->delete();
    }

    public function findById(int $id): KontenBudaya
    {
        return KontenBudaya::with([
            'user',
            'category',
            'wilayah',
            'mediaFiles',
            'tags',
            'moderationLogs.user',
        ])->findOrFail($id);
    }

    // =========================================================
    // Private helpers
    // =========================================================

    private function generateSlug(string $judul): string
    {
        $slug  = Str::slug($judul);
        $count = KontenBudaya::where('slug', 'like', "{$slug}%")->count();
        return $count > 0 ? "{$slug}-{$count}" : $slug;
    }

    private function syncTags(KontenBudaya $konten, array $tagNames): void
    {
        $tagIds = collect($tagNames)->map(function (string $nama) {
            $slug = Str::slug($nama);
            return Tag::firstOrCreate(['slug' => $slug], ['nama' => $nama])->id;
        });

        $konten->tags()->sync($tagIds);
    }
}
