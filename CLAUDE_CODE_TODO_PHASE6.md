# CLAUDE CODE TODO — PHASE 6
# Budaya Sumsel — Fitur Surat Pernyataan
# ════════════════════════════════════════════════════════════════════

## RINGKASAN TUJUAN

Fitur baru end-to-end, semua keputusan FINAL hasil diskusi dengan owner
project — JANGAN didesain ulang. Alur:

  Admin upload template (PDF) → kontributor WAJIB download template itu
  sebelum upload konten baru → kontributor print, isi fisik, tanda tangan,
  scan → kontributor upload hasil scan (PDF/JPG/PNG) sebagai field wajib di
  form kontribusi → admin bisa lihat file itu pas moderasi.

Keputusan kunci (jangan ditanya ulang):
- Tabel `surat_pernyataan` SINGLETON — selalu cuma 1 baris, replace-in-place.
- Format template dari admin: **PDF saja**.
- Format scan dari kontributor: **PDF + JPG/PNG**.
- WAJIB cuma di submission BARU. Kalau konten ditolak lalu diedit & dikirim
  ulang, file LAMA tetap dipakai — TIDAK wajib upload ulang (opsional ganti).
- Tombol download + field upload digabung dalam 1 section, diletakkan DI
  ATAS card "Siap Kirim?" di halaman `kontribusi/create.tsx`.

## ATURAN WAJIB
- Ikuti kode yang diberikan PERSIS — sudah ditulis & diverifikasi
  (`php -l`, `tsc --noEmit`, `eslint` — semua PASS, 0 error baru).
- HANYA sentuh file yang disebut di SECTION A–H.
- Migration pakai timestamp `2026_06_22_*` — JANGAN diubah urutannya, dan
  JANGAN digabung jadi 1 file dengan migration lain.
- File ini independen dari Phase 5 — TIDAK ada file yang sama-sama disentuh
  kedua TODO (mime_type fix di Section A Phase 5 dan card surat pernyataan
  di Section G di sini ada di file yang sama tapi di LOKASI BERBEDA dalam
  file itu — jadi bisa dieksekusi sebelum atau sesudah Phase 5, urutan gak
  masalah).
- Setelah semua section selesai, WAJIB jalankan migration & re-seed
  permission (Section H) — tanpa ini fitur gak akan jalan sama sekali.

## URUTAN EKSEKUSI
- SECTION A — Migration (tabel baru + kolom baru)
- SECTION B — Model (SuratPernyataan baru, KontenBudaya diupdate)
- SECTION C — Service (SuratPernyataanService baru, MediaFileService diupdate)
- SECTION D — Controller admin (SuratPernyataanController baru)
- SECTION E — Controller kontribusi (KontribusiController diupdate) + Request validation
- SECTION F — Routing, permission, nav admin
- SECTION G — Frontend (halaman admin baru, form kontribusi, tampilan verifikasi)
- SECTION H — Migrate, seed, & verifikasi

# ════════════════════════════════════════════════════════════════════
# SECTION A — MIGRATION
# ════════════════════════════════════════════════════════════════════

## A.1 — Tabel baru surat_pernyataan
FILE BARU: `database/migrations/2026_06_22_000001_create_surat_pernyataan_table.php`
ACTION: BUAT FILE BARU

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel ini SENGAJA cuma akan pernah punya 1 baris (singleton, mirip
     * pola SitePage). Template surat pernyataan yang diunggah admin, lalu
     * didownload kontributor sebelum mereka upload konten.
     */
    public function up(): void
    {
        Schema::create('surat_pernyataan', function (Blueprint $table) {
            $table->id();
            $table->string('file_path')->nullable();
            $table->string('filename')->nullable();
            $table->unsignedInteger('ukuran_kb')->nullable();

            $table->foreignId('uploaded_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surat_pernyataan');
    }
};
```

## A.2 — Kolom baru di konten_budayas
FILE BARU: `database/migrations/2026_06_22_000002_add_surat_pernyataan_url_to_konten_budayas_table.php`
ACTION: BUAT FILE BARU

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konten_budayas', function (Blueprint $table) {
            // URL lengkap (sudah di-resolve Storage::url), sama pola dengan cover_url.
            // Diisi dari hasil scan surat pernyataan yang diisi & ditandatangani kontributor.
            $table->string('surat_pernyataan_url')->nullable()->after('cover_url');
        });
    }

    public function down(): void
    {
        Schema::table('konten_budayas', function (Blueprint $table) {
            $table->dropColumn('surat_pernyataan_url');
        });
    }
};
```

CATATAN: `surat_pernyataan_url` (BUKAN `_path`) — nyimpen URL LENGKAP hasil
`Storage::url()`, persis pola yang sama dengan kolom `cover_url` yang udah
ada di tabel ini. JANGAN pakai accessor terpisah, langsung simpan full URL
pas write (lihat Section C).

# ════════════════════════════════════════════════════════════════════
# SECTION B — MODEL
# ════════════════════════════════════════════════════════════════════

## B.1 — Model baru SuratPernyataan
FILE BARU: `app/Models/SuratPernyataan.php`
ACTION: BUAT FILE BARU

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class SuratPernyataan extends Model
{
    protected $table = 'surat_pernyataan';

    protected $fillable = [
        'file_path',
        'filename',
        'ukuran_kb',
        'uploaded_by',
    ];

    /** Admin yang terakhir mengupload/mengganti template */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** URL publik file, atau null jika belum pernah diupload */
    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    /**
     * Tabel ini selalu cuma punya 1 baris. Ambil baris itu,
     * buat baris kosong dulu kalau belum ada sama sekali.
     */
    public static function current(): static
    {
        return static::query()->firstOrCreate([]);
    }
}
```

`SuratPernyataan::current()` SELALU pakai method ini buat ambil barisnya
(bukan `find(1)` atau query manual) — dia otomatis bikin baris kosong kalau
belum ada sama sekali, jadi controller gak perlu mikirin null-check baris.

## B.2 — Update KontenBudaya — tambah surat_pernyataan_url ke fillable
FILE: `app/Models/KontenBudaya.php`
ACTION: EDIT TARGETED

Cari baris ini (persis, di dalam `$fillable`):

```php
        'catatan_admin',
        'cover_url',
        'view_count',
```

Ganti jadi:

```php
        'catatan_admin',
        'cover_url',
        'surat_pernyataan_url',
        'view_count',
```

JANGAN ubah bagian lain di model ini.

# ════════════════════════════════════════════════════════════════════
# SECTION C — SERVICE
# ════════════════════════════════════════════════════════════════════

## C.1 — Service baru SuratPernyataanService
FILE BARU: `app/Services/SuratPernyataanService.php`
ACTION: BUAT FILE BARU

```php
<?php

namespace App\Services;

use App\Models\SuratPernyataan;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SuratPernyataanService
{
    /** Ganti template surat pernyataan (hapus file lama, simpan yang baru). */
    public function upload(UploadedFile $file, int $adminId): SuratPernyataan
    {
        $surat = SuratPernyataan::current();

        if ($surat->file_path) {
            Storage::disk('public')->delete($surat->file_path);
        }

        $path = $file->store('surat-pernyataan', 'public');

        $surat->update([
            'file_path'   => $path,
            'filename'    => $file->getClientOriginalName(),
            'ukuran_kb'   => (int) ceil($file->getSize() / 1024),
            'uploaded_by' => $adminId,
        ]);

        return $surat;
    }
}
```

Service ini KHUSUS buat admin ganti template (dipanggil dari
`SuratPernyataanController`, Section D). BUKAN buat nyimpen file scan dari
kontributor — itu lewat `MediaFileService::storeSuratPernyataan()` di bawah,
karena itu terkait ke `KontenBudaya` tertentu, beda konsep dari template
admin yang singleton.

## C.2 — Tambah storeSuratPernyataan() ke MediaFileService
FILE: `app/Services/MediaFileService.php`
ACTION: EDIT TARGETED

Cari method `storeCoverImage()` yang sudah ada (persis):

```php
    public function storeCoverImage(KontenBudaya $konten, UploadedFile $file): void
    {
        $path = $file->store("konten/{$konten->id}/covers", 'public');
        $konten->update(['cover_url' => Storage::url($path)]);
    }
```

Tepat SETELAH method itu, TAMBAHKAN method baru ini:

```php

    /**
     * Simpan hasil scan surat pernyataan yang sudah diisi kontributor.
     * Menimpa file lama di konten yang sama kalau ada (resubmit/ganti).
     */
    public function storeSuratPernyataan(KontenBudaya $konten, UploadedFile $file): void
    {
        $path = $file->store("konten/{$konten->id}/surat-pernyataan", 'public');
        $konten->update(['surat_pernyataan_url' => Storage::url($path)]);
    }
```

Import `UploadedFile` dan `Storage` SUDAH ADA di file ini (dipakai
`storeCoverImage`), JANGAN tambah import baru.

# ════════════════════════════════════════════════════════════════════
# SECTION D — CONTROLLER ADMIN
# ════════════════════════════════════════════════════════════════════

FILE BARU: `app/Http/Controllers/SuratPernyataanController.php`
ACTION: BUAT FILE BARU

```php
<?php

namespace App\Http\Controllers;

use App\Models\SuratPernyataan;
use App\Services\SuratPernyataanService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SuratPernyataanController extends Controller implements HasMiddleware
{
    public function __construct(private SuratPernyataanService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:surat pernyataan edit'),
        ];
    }

    public function edit()
    {
        $surat = SuratPernyataan::current();

        return inertia('surat-pernyataan/edit', [
            'surat' => [
                'filename'   => $surat->filename,
                'ukuran_kb'  => $surat->ukuran_kb,
                'file_url'   => $surat->file_url,
                'updated_at' => $surat->updated_at,
            ],
            'flash' => ['success' => session('success')],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ], [
            'file.required' => 'Pilih file PDF terlebih dahulu.',
            'file.mimes'    => 'Template surat pernyataan harus berformat PDF.',
            'file.max'      => 'Ukuran file maksimal 5MB.',
        ]);

        $this->service->upload($request->file('file'), (int) $request->user()->id);

        return redirect()
            ->route('surat-pernyataan.edit')
            ->with('success', 'Template surat pernyataan berhasil diperbarui.');
    }
}
```

Cuma 2 method (`edit`, `update`) — gak ada `index` karena ini singleton,
gak ada daftar buat ditampilin. Permission `surat pernyataan edit` dipasang
di SELURUH controller (lihat Section F.2 buat nambahin permission-nya).

# ════════════════════════════════════════════════════════════════════
# SECTION E — CONTROLLER KONTRIBUSI & VALIDASI
# ════════════════════════════════════════════════════════════════════

## E.1 — KontribusiController
FILE: `app/Http/Controllers/KontribusiController.php`
ACTION: GANTI TOTAL

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\KontribusiRequest\StoreKontribusiRequest;
use App\Http\Requests\KontribusiRequest\UpdateKontribusiRequest;
use App\Models\KontenBudaya;
use App\Models\MediaFile;
use App\Models\SuratPernyataan;
use App\Services\KategoriService;
use App\Services\KontenBudayaService;
use App\Services\MediaFileService;
use App\Services\WilayahService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KontribusiController extends Controller
{
    public function __construct(
        private KontenBudayaService $kontenService,
        private MediaFileService    $mediaService,
        private KategoriService     $kategoriService,
        private WilayahService      $wilayahService,
    ) {}

    public function index(Request $request)
    {
        return inertia('kontribusi/index', [
            'konten'  => $this->kontenService->getAllByUser(
                user:   $request->user(),
                search: $request->search,
                status: $request->status,
            ),
            'filters' => $request->only('search', 'status'),
            'flash'   => ['success' => session('success')],
        ]);
    }

    public function create()
    {
        return inertia('kontribusi/create', [
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
            'suratPernyataanAvailable' => (bool) SuratPernyataan::current()->file_path,
        ]);
    }

    /** Kontributor download template surat pernyataan kosong sebelum mengisi & scan ulang. */
    public function downloadSurat()
    {
        $surat = SuratPernyataan::current();

        abort_if(!$surat->file_path, 404, 'Surat pernyataan belum tersedia. Hubungi admin.');

        return Storage::disk('public')->download($surat->file_path, $surat->filename);
    }

    public function store(StoreKontribusiRequest $request)
    {
        $konten = $this->kontenService->create($request->validated(), $request->user());

        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($konten, $request->file('files'));
        }

        // Cover khusus (opsional, override cover dari media files)
        if ($request->hasFile('cover_image')) {
            $this->mediaService->storeCoverImage($konten, $request->file('cover_image'));
        }

        // Surat pernyataan yang sudah diisi & discan — wajib di submission baru
        if ($request->hasFile('surat_pernyataan')) {
            $this->mediaService->storeSuratPernyataan($konten, $request->file('surat_pernyataan'));
        }

        return redirect()
            ->route('kontribusi.show', $konten)
            ->with('success', 'Konten berhasil dikirim dan sedang menunggu review admin.');
    }

    // Route model binding — parameter name harus cocok dengan {kontribusi} di route resource
    public function show(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);

        $kontribusi->load([
            'user', 'category', 'wilayah', 'mediaFiles', 'tags', 'moderationLogs.user',
        ]);

        return inertia('kontribusi/show', [
            'konten' => $kontribusi,
        ]);
    }

    public function edit(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        $kontribusi->load(['mediaFiles', 'tags', 'category', 'wilayah']);

        return inertia('kontribusi/edit', [
            'konten'    => $kontribusi,
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
        ]);
    }

    public function update(UpdateKontribusiRequest $request, KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        $this->kontenService->update($kontribusi, $request->validated());

        if ($request->has('delete_media')) {
            foreach ($request->delete_media as $mediaId) {
                $media = MediaFile::where('id', $mediaId)
                                  ->where('konten_id', $kontribusi->id)
                                  ->first();
                if ($media) {
                    $this->mediaService->deleteFile($media);
                }
            }
        }

        if ($request->filled('primary_media')) {
            $media = MediaFile::where('id', $request->primary_media)
                              ->where('konten_id', $kontribusi->id)
                              ->firstOrFail();
            $this->mediaService->setPrimary($media);
        }

        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($kontribusi, $request->file('files'));
        }

        if ($request->hasFile('cover_image')) {
            $this->mediaService->storeCoverImage($kontribusi, $request->file('cover_image'));
        }

        // Opsional saat edit — kalau ditolak & kirim ulang, file lama tetap dipakai
        // kecuali kontributor sengaja unggah ulang.
        if ($request->hasFile('surat_pernyataan')) {
            $this->mediaService->storeSuratPernyataan($kontribusi, $request->file('surat_pernyataan'));
        }

        $message = $kontribusi->wasChanged('status')
            ? 'Konten berhasil diperbarui dan dikirim ulang untuk review admin.'
            : 'Konten berhasil diperbarui.';

        return redirect()
            ->route('kontribusi.show', $kontribusi)
            ->with('success', $message);
    }

    public function destroy(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa dihapus langsung. Hubungi admin.');

        $this->kontenService->delete($kontribusi);

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten berhasil dihapus.');
    }

    // Parameter {kontribusi} di route revise/decline harus cocok dengan nama ini
    public function respondRevise(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status !== 'rejected', 403);

        $this->kontenService->respondRevise($kontribusi, request()->user());

        return redirect()
            ->route('kontribusi.edit', $kontribusi)
            ->with('success', 'Silakan perbaiki konten sesuai catatan admin, lalu simpan.');
    }

    public function respondDecline(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status !== 'rejected', 403);

        $this->kontenService->respondDecline($kontribusi, request()->user());

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten ditandai sebagai ditolak final.');
    }

    // (int) cast mencegah strict !== mismatch antar environment database driver
    private function authorizeOwner(KontenBudaya $konten): void
    {
        abort_if((int) $konten->user_id !== (int) auth()->id(), 403);
    }
}
```

CATATAN:
- Method baru `downloadSurat()` dipanggil kontributor buat download
  TEMPLATE (bukan punya mereka sendiri). Route-nya di Section F.1 — HARUS
  didaftarkan SEBELUM `Route::resource('kontribusi', ...)`, kalau kebalik
  segmen `surat-pernyataan` bakal ketangkep jadi parameter `{kontribusi}`.
- `store()` & `update()` SAMA-SAMA panggil `storeSuratPernyataan()` kalau ada
  file — bedanya cuma di validasi (Section E.2: required di Store, nullable
  di Update), bukan di controller ini.

## E.2 — StoreKontribusiRequest
FILE: `app/Http/Requests/KontribusiRequest/StoreKontribusiRequest.php`
ACTION: GANTI TOTAL

```php
<?php

namespace App\Http\Requests\KontribusiRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreKontribusiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Metadata konten
            'judul'       => ['required', 'string', 'max:255'],
            'deskripsi'   => ['required', 'string', 'min:50'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'wilayah_id'  => ['required', 'integer', 'exists:wilayah,id'],
            'tags'        => ['nullable', 'array', 'max:10'],
            'tags.*'      => ['string', 'max:50'],

            // Gambar cover khusus (opsional) — hanya berlaku untuk konten audio/video
            'cover_image' => ['nullable', 'image', 'max:5120'],

            // File media — wajib upload minimal 1 file
            'files'       => ['required', 'array', 'min:1', 'max:10'],
            'files.*'     => [
                'required',
                'file',
                'max:204800',  // 200MB max per file
                'mimes:jpeg,jpg,png,webp,gif,mp4,webm,mov,mp3,wav,ogg,m4a,pdf',
            ],

            // Surat pernyataan yang sudah diisi & discan — wajib di submission baru
            'surat_pernyataan' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required'       => 'Judul konten wajib diisi.',
            'deskripsi.required'   => 'Deskripsi wajib diisi.',
            'deskripsi.min'        => 'Deskripsi minimal 50 karakter.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak valid.',
            'wilayah_id.required'  => 'Wilayah wajib dipilih.',
            'wilayah_id.exists'    => 'Wilayah tidak valid.',
            'files.required'       => 'Minimal 1 file media wajib diunggah.',
            'files.min'            => 'Minimal 1 file media wajib diunggah.',
            'files.max'            => 'Maksimal 10 file per konten.',
            'files.*.max'          => 'Ukuran file maksimal 200MB.',
            'files.*.mimes'        => 'Format file tidak didukung. Format yang diterima: gambar (JPG, PNG, WEBP, GIF), video (MP4, WEBM, MOV), audio (MP3, WAV, OGG, M4A), dokumen (PDF).',
            'surat_pernyataan.required' => 'Surat pernyataan yang sudah diisi & discan wajib diunggah.',
            'surat_pernyataan.mimes'    => 'Format surat pernyataan harus PDF, JPG, atau PNG.',
            'surat_pernyataan.max'      => 'Ukuran surat pernyataan maksimal 10MB.',
        ];
    }
}
```

## E.3 — UpdateKontribusiRequest
FILE: `app/Http/Requests/KontribusiRequest/UpdateKontribusiRequest.php`
ACTION: GANTI TOTAL

```php
<?php

namespace App\Http\Requests\KontribusiRequest;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKontribusiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Metadata konten
            'judul'       => ['required', 'string', 'max:255'],
            'deskripsi'   => ['required', 'string', 'min:50'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'wilayah_id'  => ['required', 'integer', 'exists:wilayah,id'],
            'tags'        => ['nullable', 'array', 'max:10'],
            'tags.*'      => ['string', 'max:50'],

            // Gambar cover khusus (opsional)
            'cover_image' => ['nullable', 'image', 'max:5120'],

            // File tambahan — opsional saat update
            'files'       => ['nullable', 'array', 'max:10'],
            'files.*'     => [
                'file',
                'max:204800',
                'mimes:jpeg,jpg,png,webp,gif,mp4,webm,mov,mp3,wav,ogg,m4a,pdf',
            ],

            // ID media yang ingin dihapus
            'delete_media'   => ['nullable', 'array'],
            'delete_media.*' => ['integer', 'exists:media_files,id'],

            // ID media yang ingin dijadikan primary
            'primary_media'  => ['nullable', 'integer', 'exists:media_files,id'],

            // Opsional saat edit/kirim ulang — file lama tetap dipakai kalau tidak diisi ulang
            'surat_pernyataan' => ['nullable', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required'       => 'Judul konten wajib diisi.',
            'deskripsi.required'   => 'Deskripsi wajib diisi.',
            'deskripsi.min'        => 'Deskripsi minimal 50 karakter.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'wilayah_id.required'  => 'Wilayah wajib dipilih.',
            'files.max'            => 'Maksimal 10 file tambahan.',
            'files.*.max'          => 'Ukuran file maksimal 200MB.',
            'files.*.mimes'        => 'Format file tidak didukung.',
            'surat_pernyataan.mimes' => 'Format surat pernyataan harus PDF, JPG, atau PNG.',
            'surat_pernyataan.max'   => 'Ukuran surat pernyataan maksimal 10MB.',
        ];
    }
}
```

PERHATIKAN BEDANYA: `surat_pernyataan` di Store = `required`, di Update =
`nullable`. Ini SENGAJA, sesuai keputusan "gak perlu upload ulang pas edit".
JANGAN disamakan jadi required di kedua tempat.

# ════════════════════════════════════════════════════════════════════
# SECTION F — ROUTING, PERMISSION, NAV ADMIN
# ════════════════════════════════════════════════════════════════════

## F.1 — routes/web.php
FILE: `routes/web.php`
ACTION: GANTI TOTAL

```php
<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KomentarController;
use App\Http\Controllers\KontenBudayaController;
use App\Http\Controllers\KontribusiController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\PublicKomentarController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SitePageController;
use App\Http\Controllers\SuratPernyataanController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WilayahController;
use Illuminate\Support\Facades\Route;

// -------------------------------------------------------
// Public — tidak perlu login
// -------------------------------------------------------
Route::get('/',              [PublicController::class, 'galeri'])->name('home');
Route::get('/galeri',        [PublicController::class, 'galeri'])->name('galeri.index');
Route::get('/galeri/{konten:slug}', [PublicController::class, 'show'])->name('galeri.show');
Route::get('/tentang-kami',  [PublicController::class, 'tentang'])->name('tentang');
Route::get('/kontak',        [PublicController::class, 'kontak'])->name('kontak');

// Auth required — rating dan komentar publik
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/galeri/{konten}/rating',   [RatingController::class, 'store'])->name('rating.store');
    Route::post('/galeri/{konten}/komentar', [PublicKomentarController::class, 'store'])->name('komentar.publik.store');
});

// -------------------------------------------------------
// Dashboard & fitur authenticated
// -------------------------------------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Kontribusi
    // Route literal HARUS di atas Route::resource, supaya 'surat-pernyataan'
    // gak ketangkep sebagai parameter {kontribusi} oleh route show.
    Route::get('kontribusi/surat-pernyataan/download', [KontribusiController::class, 'downloadSurat'])->name('kontribusi.surat-pernyataan.download');
    Route::resource('kontribusi', KontribusiController::class);
    Route::patch('kontribusi/{kontribusi}/revise',  [KontribusiController::class, 'respondRevise'])->name('kontribusi.revise');
    Route::patch('kontribusi/{kontribusi}/decline', [KontribusiController::class, 'respondDecline'])->name('kontribusi.decline');

    // Admin — moderasi konten
    Route::resource('konten', KontenBudayaController::class)->only(['index', 'show', 'destroy']);
    Route::patch('konten/{konten}/approve', [KontenBudayaController::class, 'approve'])->name('konten.approve');
    Route::patch('konten/{konten}/reject',  [KontenBudayaController::class, 'reject'])->name('konten.reject');

    // Admin — data master
    Route::resource('kategori', KategoriController::class);
    Route::resource('wilayah',  WilayahController::class);
    Route::resource('tag',      TagController::class);

    // Admin — komentar
    Route::get('komentar',                  [KomentarController::class, 'index'])->name('komentar.index');
    Route::patch('komentar/{comment}/hide', [KomentarController::class, 'hide'])->name('komentar.hide');
    Route::delete('komentar/{comment}',     [KomentarController::class, 'destroy'])->name('komentar.destroy');

    // Admin — manajemen halaman (CMS)
    Route::get('halaman',                          [SitePageController::class, 'index'])->name('halaman.index');
    Route::get('halaman/{page:key}/edit',          [SitePageController::class, 'edit'])->name('halaman.edit');
    Route::put('halaman/{page:key}',               [SitePageController::class, 'update'])->name('halaman.update');
    Route::post('halaman/{page:key}/hero',         [SitePageController::class, 'uploadHero'])->name('halaman.hero');
    Route::delete('halaman/{page:key}/hero',       [SitePageController::class, 'removeHero'])->name('halaman.hero.remove');

    // Admin — template surat pernyataan (singleton)
    Route::get('surat-pernyataan',  [SuratPernyataanController::class, 'edit'])->name('surat-pernyataan.edit');
    Route::post('surat-pernyataan', [SuratPernyataanController::class, 'update'])->name('surat-pernyataan.update');

    // User & role management
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
});

require __DIR__ . '/settings.php';
```

## F.2 — Permission baru
FILE: `config/starterkit.php`
ACTION: EDIT TARGETED

Cari blok ini (persis):

```php
        // -------------------------------------------------------
        // Manajemen Halaman (CMS)
        // -------------------------------------------------------
        'halaman index' => 'Lihat Daftar Halaman',
        'halaman edit'  => 'Edit Konten Halaman',
```

Ganti jadi:

```php
        // -------------------------------------------------------
        // Manajemen Halaman (CMS)
        // -------------------------------------------------------
        'halaman index' => 'Lihat Daftar Halaman',
        'halaman edit'  => 'Edit Konten Halaman',

        // -------------------------------------------------------
        // Surat Pernyataan (template singleton)
        // -------------------------------------------------------
        'surat pernyataan edit' => 'Kelola Template Surat Pernyataan',
```

JANGAN sentuh seeder (`PermissionSeeder.php`/`RoleSeeder.php`) — keduanya
SUDAH otomatis baca dari config ini (`PermissionSeeder` loop
`config('starterkit.permissions')`, `RoleSeeder` kasih admin SEMUA
permission via `syncPermissions(Permission::all())`). Re-seed dilakukan di
Section H, bukan ngedit kode seeder-nya.

## F.3 — Nav admin
FILE: `resources/js/components/app-sidebar.tsx`
ACTION: GANTI TOTAL

```tsx
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, CheckSquare, FileSignature, FileText, FolderOpen, Globe, KeyIcon, LayoutGrid, MapPin, MessageSquare, Tag, Upload, User } from 'lucide-react';
import AppLogo from './app-logo';
import users from '@/routes/users';
import roles from '@/routes/roles';
import { dashboard } from '@/routes';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Halaman Publik', href: '/', icon: Globe, external: true },
];

const kontribusiItems: NavItem[] = [
    { title: 'Konten Saya', href: '/kontribusi', icon: BookOpen },
    { title: 'Upload Konten', href: '/kontribusi/create', icon: Upload },
];

const adminKontenItems: NavItem[] = [
    { title: 'Semua Konten',  href: '/konten',   icon: CheckSquare,    permissions: ['konten index'] },
    { title: 'Komentar',      href: '/komentar', icon: MessageSquare,  permissions: ['komentar index'] },
];

const adminDataItems: NavItem[] = [
    { title: 'Kategori', href: '/kategori', icon: FolderOpen, permissions: ['kategori index'] },
    { title: 'Wilayah',  href: '/wilayah',  icon: MapPin,     permissions: ['wilayah index'] },
    { title: 'Tag',      href: '/tag',      icon: Tag,        permissions: ['tag index'] },
];

const adminHalamanItems: NavItem[] = [
    { title: 'Manajemen Halaman', href: '/halaman', icon: FileText, permissions: ['halaman index'] },
    { title: 'Surat Pernyataan', href: '/surat-pernyataan', icon: FileSignature, permissions: ['surat pernyataan edit'] },
];

const userManagementItems: NavItem[] = [
    { title: 'Users', href: users.index(), icon: User,     permissions: ['users index'] },
    { title: 'Roles', href: roles.index(), icon: KeyIcon,  permissions: ['roles index'] },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain section="Platform"     items={mainNavItems} />
                <NavMain section="Kontribusi"   items={kontribusiItems} />
                <NavMain section="Moderasi"     items={adminKontenItems} />
                <NavMain section="Data Master"  items={adminDataItems} />
                <NavMain section="Halaman"      items={adminHalamanItems} />
                <NavMain section="Manajemen"    items={userManagementItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
```

## F.4 — Tipe TypeScript
FILE: `resources/js/types/index.d.ts`
ACTION: EDIT TARGETED

Cari baris ini (persis, di dalam `interface KontenBudaya`):

```ts
    catatan_admin: string | null; cover_url: string | null; view_count: number;
```

Ganti jadi:

```ts
    catatan_admin: string | null; cover_url: string | null; surat_pernyataan_url: string | null; view_count: number;
```

JANGAN ganti total file ini — banyak interface lain yang gak boleh disentuh.

# ════════════════════════════════════════════════════════════════════
# SECTION G — FRONTEND
# ════════════════════════════════════════════════════════════════════

## G.1 — Halaman admin baru
FILE BARU: `resources/js/pages/surat-pernyataan/edit.tsx`
ACTION: BUAT FILE BARU (buat folder `resources/js/pages/surat-pernyataan/`
kalau belum ada)

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface Surat {
    filename: string | null;
    ukuran_kb: number | null;
    file_url: string | null;
    updated_at: string | null;
}

interface Props {
    surat: Surat;
    flash?: { success?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Surat Pernyataan', href: '/surat-pernyataan' },
];

export default function SuratPernyataanEdit({ surat, flash }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('file', file);

        setProcessing(true);
        router.post('/surat-pernyataan', data, {
            forceFormData: true,
            onFinish: () => {
                setProcessing(false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Pernyataan" />

            <div className="space-y-6 p-6 max-w-2xl">
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Template Surat Pernyataan</CardTitle>
                        <CardDescription>
                            File PDF kosong yang akan diunduh kontributor sebelum mengunggah konten. Mereka akan
                            mencetak, mengisi, menandatangani, lalu mengunggah kembali hasil scan-nya saat submit konten.
                            Tabel ini cuma menyimpan 1 versi — upload file baru akan menggantikan yang lama.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {surat.file_url ? (
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                                <FileText className="size-8 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{surat.filename}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {surat.ukuran_kb ? `${(surat.ukuran_kb / 1024).toFixed(1)} MB` : ''}
                                        {surat.updated_at && ` · Diperbarui ${new Date(surat.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                                    </p>
                                </div>
                                <a href={surat.file_url} target="_blank" rel="noreferrer">
                                    <Button type="button" variant="outline" size="sm">Lihat</Button>
                                </a>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                Belum ada template diunggah. Kontributor tidak akan bisa mengirim konten baru
                                sampai template ini tersedia.
                            </div>
                        )}

                        <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleChange} />
                        <Button onClick={() => fileRef.current?.click()} disabled={processing}>
                            <Upload className="size-4" />
                            {processing ? 'Mengunggah...' : surat.file_url ? 'Ganti Template' : 'Upload Template'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
```

## G.2 — Form kontribusi (create)
FILE: `resources/js/pages/kontribusi/create.tsx`
ACTION: GANTI TOTAL

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category, Wilayah } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, FileText, Headphones, ImageIcon, Upload, Video, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface CoverPreview { file: File; preview: string }

interface Props { kategoris: Category[]; wilayahs: Wilayah[]; suratPernyataanAvailable: boolean }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konten Saya', href: '/kontribusi' },
    { title: 'Upload Konten', href: '/kontribusi/create' },
];

interface FilePreview { file: File; preview?: string; tipe: string }

function detectTipe(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
}

function FileIcon({ tipe }: { tipe: string }) {
    if (tipe === 'image') return <ImageIcon className="size-5 text-blue-500" />;
    if (tipe === 'video') return <Video className="size-5 text-purple-500" />;
    if (tipe === 'audio') return <Headphones className="size-5 text-orange-500" />;
    return <FileText className="size-5 text-gray-500" />;
}

export default function KontribusiCreate({ kategoris, wilayahs, suratPernyataanAvailable }: Props) {
    const [files, setFiles] = useState<FilePreview[]>([]);
    const [coverImage, setCoverImage] = useState<CoverPreview | null>(null);
    const [suratFile, setSuratFile] = useState<File | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const suratInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        judul: '', deskripsi: '', category_id: '', wilayah_id: '',
    });

    const addFiles = useCallback((newFiles: File[]) => {
        const previews: FilePreview[] = newFiles.map((file) => {
            const tipe = detectTipe(file);
            const preview = (tipe === 'image' || tipe === 'video' || tipe === 'audio')
                ? URL.createObjectURL(file)
                : undefined;
            return { file, preview, tipe };
        });
        setFiles((prev) => [...prev, ...previews].slice(0, 10));
    }, []);

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const copy = [...prev];
            if (copy[index].preview) URL.revokeObjectURL(copy[index].preview!);
            copy.splice(index, 1);
            return copy;
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t) && tags.length < 10) {
            setTags((prev) => [...prev, t]);
            setTagInput('');
        }
    };

    const handleCoverChange = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        if (coverImage?.preview) URL.revokeObjectURL(coverImage.preview);
        setCoverImage({ file, preview: URL.createObjectURL(file) });
    };

    const removeCover = () => {
        if (coverImage?.preview) URL.revokeObjectURL(coverImage.preview);
        setCoverImage(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!form.judul) newErrors.judul = 'Judul wajib diisi.';
        if (form.deskripsi.length < 50) newErrors.deskripsi = 'Deskripsi minimal 50 karakter.';
        if (!form.category_id) newErrors.category_id = 'Kategori wajib dipilih.';
        if (!form.wilayah_id) newErrors.wilayah_id = 'Wilayah wajib dipilih.';
        if (files.length === 0) newErrors.files = 'Minimal 1 file media wajib diunggah.';
        if (!suratFile) newErrors.surat_pernyataan = 'Surat pernyataan yang sudah diisi & discan wajib diunggah.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setProcessing(true);
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        tags.forEach((t) => data.append('tags[]', t));
        files.forEach((f) => data.append('files[]', f.file));
        if (coverImage) data.append('cover_image', coverImage.file);
        if (suratFile) data.append('surat_pernyataan', suratFile);

        router.post('/kontribusi', data, {
            onError: (e) => { setErrors(e); setProcessing(false); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Konten Budaya" />

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 p-6 lg:grid-cols-3">
                    {/* Kolom kiri — metadata */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Konten</CardTitle>
                                <CardDescription>Isi detail informasi konten budaya yang akan diunggah.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="judul">Judul <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="judul"
                                        className="mt-1.5"
                                        placeholder="Contoh: Tari Gending Sriwijaya dari Palembang"
                                        value={form.judul}
                                        onChange={(e) => setForm({ ...form, judul: e.target.value })}
                                    />
                                    {errors.judul && <p className="mt-1 text-xs text-destructive">{errors.judul}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="deskripsi">
                                        Deskripsi <span className="text-destructive">*</span>
                                        <span className="ml-1 font-normal text-muted-foreground">(min. 50 karakter)</span>
                                    </Label>
                                    <textarea
                                        id="deskripsi"
                                        rows={5}
                                        className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                                        placeholder="Jelaskan konten budaya ini secara detail — sejarah, asal daerah, makna budaya, cara penyajian, dll."
                                        value={form.deskripsi}
                                        onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                    />
                                    <div className="mt-1 flex justify-between">
                                        {errors.deskripsi
                                            ? <p className="text-xs text-destructive">{errors.deskripsi}</p>
                                            : <span />
                                        }
                                        <span className={`text-xs ${form.deskripsi.length < 50 ? 'text-muted-foreground' : 'text-emerald-600'}`}>
                                            {form.deskripsi.length} karakter
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Kategori <span className="text-destructive">*</span></Label>
                                        <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                                            <SelectTrigger className="mt-1.5">
                                                <SelectValue placeholder="Pilih kategori..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kategoris.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="mt-1 text-xs text-destructive">{errors.category_id}</p>}
                                    </div>

                                    <div>
                                        <Label>Wilayah <span className="text-destructive">*</span></Label>
                                        <Select value={form.wilayah_id} onValueChange={(v) => setForm({ ...form, wilayah_id: v })}>
                                            <SelectTrigger className="mt-1.5">
                                                <SelectValue placeholder="Pilih wilayah..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wilayahs.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.wilayah_id && <p className="mt-1 text-xs text-destructive">{errors.wilayah_id}</p>}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <Label>Tag <span className="font-normal text-muted-foreground">(opsional, maks. 10)</span></Label>
                                    <div className="mt-1.5 flex gap-2">
                                        <Input
                                            placeholder="Tambah tag..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                        />
                                        <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 10}>Tambah</Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {tags.map((t) => (
                                                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                                                    {t}
                                                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                                                        <X className="size-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cover image */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Gambar Cover <span className="font-normal text-muted-foreground text-sm">(Opsional)</span></CardTitle>
                                <CardDescription>
                                    Thumbnail yang ditampilkan di daftar konten. Wajib diisi jika file media hanya berupa audio atau video.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {coverImage ? (
                                    <div className="relative w-full max-w-xs">
                                        <img src={coverImage.preview} alt="Cover" className="aspect-video w-full rounded-lg object-cover border" />
                                        <button type="button" onClick={removeCover}
                                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                                            <X className="size-3.5" />
                                        </button>
                                        <p className="mt-1.5 truncate text-xs text-muted-foreground">{coverImage.file.name}</p>
                                    </div>
                                ) : (
                                    <div
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        <ImageIcon className="size-7 text-muted-foreground" />
                                        <p className="text-sm font-medium">Pilih gambar cover</p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Maks. 5MB</p>
                                    </div>
                                )}
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverChange(f); e.target.value = ''; }}
                                />
                                {errors.cover_image && <p className="mt-1 text-xs text-destructive">{errors.cover_image}</p>}
                            </CardContent>
                        </Card>

                        {/* Upload file */}
                        <Card>
                            <CardHeader>
                                <CardTitle>File Media</CardTitle>
                                <CardDescription>
                                    Upload gambar, video, audio, atau dokumen. Maks. 10 file, 200MB per file.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Drop zone */}
                                <div
                                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <Upload className="mx-auto mb-3 size-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">Klik atau drag & drop file di sini</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        JPG, PNG, WEBP, MP4, MP3, WAV, PDF · Maks. 200MB/file
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,audio/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                                    />
                                </div>

                                {errors.files && <p className="text-xs text-destructive">{errors.files}</p>}

                                {/* Preview files — INLINE: gambar tampil, video & audio bisa diputar */}
                                {files.length > 0 && (
                                    <div className="space-y-4">
                                        {files.map((f, i) => (
                                            <div key={i} className="rounded-lg border bg-muted/20 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FileIcon tipe={f.tipe} />
                                                        <span className="truncate text-sm font-medium">{f.file.name}</span>
                                                        {i === 0 && (
                                                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Cover</span>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-muted-foreground hover:text-foreground">
                                                        <X className="size-4" />
                                                    </button>
                                                </div>

                                                {f.tipe === 'image' && f.preview && (
                                                    <img src={f.preview} alt={f.file.name} className="max-h-80 w-full rounded-md object-contain bg-black/5" />
                                                )}
                                                {f.tipe === 'video' && f.preview && (
                                                    <video src={f.preview} controls className="max-h-80 w-full rounded-md bg-black" />
                                                )}
                                                {f.tipe === 'audio' && f.preview && (
                                                    <audio src={f.preview} controls className="w-full" />
                                                )}
                                                {f.tipe === 'document' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {f.file.size >= 1048576 ? `${(f.file.size / 1048576).toFixed(1)} MB` : `${Math.round(f.file.size / 1024)} KB`} · Dokumen (preview tidak tersedia)
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Kolom kanan — surat pernyataan + submit */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Surat Pernyataan</CardTitle>
                                <CardDescription className="text-xs leading-relaxed">
                                    Download surat pernyataan, print &amp; isi secara fisik, lalu unggah kembali hasil scan-nya di sini sebelum mengirim konten.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {suratPernyataanAvailable ? (
                                    <a href="/kontribusi/surat-pernyataan/download">
                                        <Button type="button" variant="outline" size="sm" className="w-full">
                                            <Download className="size-4" /> Download Surat Pernyataan
                                        </Button>
                                    </a>
                                ) : (
                                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                        Template surat pernyataan belum tersedia. Hubungi admin sebelum mengunggah konten.
                                    </p>
                                )}

                                <div>
                                    <Label>Unggah Surat yang Sudah Diisi <span className="text-destructive">*</span></Label>

                                    {suratFile ? (
                                        <div className="mt-1.5 flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <FileText className="size-5 shrink-0 text-gray-500" />
                                                <span className="truncate text-sm font-medium">{suratFile.name}</span>
                                            </div>
                                            <button type="button" onClick={() => setSuratFile(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => suratInputRef.current?.click()}
                                            className="mt-1.5 cursor-pointer rounded-lg border-2 border-dashed p-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30"
                                        >
                                            Klik untuk pilih file (PDF, JPG, atau PNG)
                                        </div>
                                    )}

                                    <input
                                        ref={suratInputRef}
                                        type="file"
                                        accept="application/pdf,.pdf,image/jpeg,image/png"
                                        className="hidden"
                                        onChange={(e) => setSuratFile(e.target.files?.[0] ?? null)}
                                    />

                                    {errors.surat_pernyataan && <p className="mt-1 text-xs text-destructive">{errors.surat_pernyataan}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-base">Siap Kirim?</CardTitle>
                                <CardDescription className="text-xs leading-relaxed">
                                    Konten akan masuk ke antrian review admin setelah dikirim. Admin akan memeriksa kesesuaian informasi sebelum konten ditayangkan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">Checklist sebelum kirim:</p>
                                    <ul className="space-y-1 pl-3">
                                        {[
                                            { ok: form.judul.length > 0, text: 'Judul diisi' },
                                            { ok: form.deskripsi.length >= 50, text: 'Deskripsi ≥ 50 karakter' },
                                            { ok: !!form.category_id, text: 'Kategori dipilih' },
                                            { ok: !!form.wilayah_id, text: 'Wilayah dipilih' },
                                            { ok: files.length > 0, text: 'Min. 1 file diunggah' },
                                            { ok: !!suratFile, text: 'Surat pernyataan diunggah' },
                                        ].map(({ ok, text }) => (
                                            <li key={text} className={`flex items-center gap-1.5 ${ok ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                                <span>{ok ? '✓' : '○'}</span> {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Mengirim...' : 'Kirim untuk Review'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
```

CATATAN PENTING:
- Section "Surat Pernyataan" ada di KOLOM KANAN, DI ATAS card "Siap Kirim?"
  — bukan di kolom kiri bersama card lain, dan bukan di dalam card submit
  itu sendiri. Ini keputusan final, JANGAN dipindah.
- Checklist di card "Siap Kirim?" nambah 1 baris: "Surat pernyataan
  diunggah" — ikut pola checklist yang sudah ada (✓/○).
- Tombol download cuma aktif/muncul normal kalau `suratPernyataanAvailable`
  true (dikirim dari `KontribusiController::create()`, Section E.1) — kalau
  false, tampilkan pesan peringatan, BUKAN tombol disabled.

## G.3 — Form kontribusi (edit)
FILE: `resources/js/pages/kontribusi/edit.tsx`
ACTION: GANTI TOTAL

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category, KontenBudaya, MediaFile, Wilayah } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, ImageIcon, Star, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface CoverPreview { file: File; preview: string }

interface Props { konten: KontenBudaya; kategoris: Category[]; wilayahs: Wilayah[] }

export default function KontribusiEdit({ konten, kategoris, wilayahs }: Props) {
    const [form, setForm] = useState({
        judul: konten.judul,
        deskripsi: konten.deskripsi,
        category_id: String(konten.category_id),
        wilayah_id: String(konten.wilayah_id),
    });
    const [tags, setTags] = useState<string[]>(konten.tags?.map((t) => t.nama) ?? []);
    const [tagInput, setTagInput] = useState('');
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [coverImage, setCoverImage] = useState<CoverPreview | null>(null);
    const [suratFile, setSuratFile] = useState<File | null>(null);
    const [deleteMediaIds, setDeleteMediaIds] = useState<number[]>([]);
    const [primaryMediaId, setPrimaryMediaId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const suratInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Konten Saya', href: '/kontribusi' },
        { title: konten.judul, href: `/kontribusi/${konten.slug}` },
        { title: 'Edit', href: `/kontribusi/${konten.slug}/edit` },
    ];

    const existingMedia = (konten.media_files ?? []).filter((m) => !deleteMediaIds.includes(m.id));

    const handleCoverChange = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        if (coverImage?.preview) URL.revokeObjectURL(coverImage.preview);
        setCoverImage({ file, preview: URL.createObjectURL(file) });
    };

    const removeCover = () => {
        if (coverImage?.preview) URL.revokeObjectURL(coverImage.preview);
        setCoverImage(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const data = new FormData();
        data.append('_method', 'PUT');
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        tags.forEach((t) => data.append('tags[]', t));
        newFiles.forEach((f) => data.append('files[]', f));
        deleteMediaIds.forEach((id) => data.append('delete_media[]', String(id)));
        if (primaryMediaId) data.append('primary_media', String(primaryMediaId));
        if (coverImage) data.append('cover_image', coverImage.file);
        if (suratFile) data.append('surat_pernyataan', suratFile);
        router.post(`/kontribusi/${konten.slug}`, data, { onError: () => setProcessing(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${konten.judul}`} />
            {konten.status === 'rejected' && (
                <div className="mx-6 mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                    <strong>Sedang merevisi konten yang ditolak.</strong> Setelah kamu simpan, konten akan otomatis masuk ke antrian review ulang.
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 p-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader><CardTitle>Informasi Konten</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="judul">Judul</Label>
                                    <Input id="judul" className="mt-1.5" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <textarea id="deskripsi" rows={5} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Kategori</Label>
                                        <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                                            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                            <SelectContent>{kategoris.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Wilayah</Label>
                                        <Select value={form.wilayah_id} onValueChange={(v) => setForm({ ...form, wilayah_id: v })}>
                                            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                            <SelectContent>{wilayahs.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.nama}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Tag</Label>
                                    <div className="mt-1.5 flex gap-2">
                                        <Input placeholder="Tambah tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(''); } } }} />
                                        <Button type="button" variant="outline" onClick={() => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }}>+</Button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {tags.map((t) => (<span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">{t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}><X className="size-3" /></button></span>))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Gambar Cover <span className="font-normal text-muted-foreground text-sm">(Opsional)</span></CardTitle>
                                <CardDescription>Ganti thumbnail konten. Diperlukan jika file media hanya berupa audio atau video.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {konten.cover_url && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(konten.cover_url) && !coverImage && (
                                    <div className="mb-3">
                                        <p className="mb-1.5 text-xs text-muted-foreground">Cover saat ini</p>
                                        <img src={konten.cover_url} alt="Cover" className="aspect-video w-full max-w-xs rounded-lg object-cover border" />
                                    </div>
                                )}
                                {coverImage ? (
                                    <div className="relative w-full max-w-xs">
                                        <img src={coverImage.preview} alt="Cover baru" className="aspect-video w-full rounded-lg object-cover border" />
                                        <button type="button" onClick={removeCover}
                                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                                            <X className="size-3.5" />
                                        </button>
                                        <p className="mt-1.5 truncate text-xs text-muted-foreground">{coverImage.file.name}</p>
                                    </div>
                                ) : (
                                    <div
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        <ImageIcon className="size-6 text-muted-foreground" />
                                        <p className="text-sm font-medium">{konten.cover_url ? 'Ganti gambar cover' : 'Pilih gambar cover'}</p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Maks. 5MB</p>
                                    </div>
                                )}
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverChange(f); e.target.value = ''; }}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>File Media</CardTitle><CardDescription>Kelola file yang sudah ada atau tambah file baru.</CardDescription></CardHeader>
                            <CardContent className="space-y-3">
                                {existingMedia.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">File saat ini</p>
                                        {existingMedia.map((file) => (
                                            <div key={file.id} className={`flex items-center gap-3 rounded-lg border p-3 ${primaryMediaId === file.id || (!primaryMediaId && file.is_primary) ? 'border-primary bg-primary/5' : ''}`}>
                                                <FileText className="size-8 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm">{file.filename}</p>
                                                    <p className="text-xs text-muted-foreground">{file.tipe}</p>
                                                </div>
                                                <button type="button" title="Jadikan cover" onClick={() => setPrimaryMediaId(file.id)} className={`text-amber-500 ${primaryMediaId === file.id || (!primaryMediaId && file.is_primary) ? 'opacity-100' : 'opacity-30 hover:opacity-70'}`}>
                                                    <Star className="size-4" />
                                                </button>
                                                <button type="button" onClick={() => setDeleteMediaIds([...deleteMediaIds, file.id])} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="cursor-pointer rounded-xl border-2 border-dashed p-6 text-center hover:bg-muted/50" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Klik untuk tambah file baru</p>
                                    <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf" className="hidden" onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files ?? [])])} />
                                </div>
                                {newFiles.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">File baru yang akan ditambahkan</p>
                                        {newFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                                                <span className="truncate">{f.name}</span>
                                                <button type="button" onClick={() => setNewFiles(newFiles.filter((_, j) => j !== i))}><X className="size-4 text-muted-foreground" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Surat Pernyataan</CardTitle>
                                <CardDescription className="text-xs leading-relaxed">
                                    Sudah pernah diunggah saat submit pertama kali. Gak perlu diunggah ulang kecuali kamu mau menggantinya.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {konten.surat_pernyataan_url && !suratFile && (
                                    <a
                                        href={konten.surat_pernyataan_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-lg border bg-muted/20 p-3 text-sm transition-colors hover:border-primary/40"
                                    >
                                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="text-muted-foreground">Lihat surat pernyataan yang sudah diunggah</span>
                                    </a>
                                )}

                                {suratFile && (
                                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <FileText className="size-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate text-sm font-medium">{suratFile.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setSuratFile(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={suratInputRef}
                                    type="file"
                                    accept="application/pdf,.pdf,image/jpeg,image/png"
                                    className="hidden"
                                    onChange={(e) => setSuratFile(e.target.files?.[0] ?? null)}
                                />
                                <Button type="button" variant="outline" size="sm" onClick={() => suratInputRef.current?.click()}>
                                    {konten.surat_pernyataan_url ? 'Ganti File' : 'Upload Surat Pernyataan'}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="sticky top-6">
                            <CardContent className="space-y-3 pt-6">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {konten.status === 'rejected' ? 'Simpan & Kirim Ulang' : 'Simpan Perubahan'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => history.back()}>Batal</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
```

CATATAN: di halaman edit, surat pernyataan OPSIONAL — kalau kontributor gak
pilih file baru, file lama (`konten.surat_pernyataan_url`) tetap dipakai
(gak perlu logic tambahan, backend Section E.1 udah handle ini otomatis
lewat `hasFile()` check).

## G.4 — Tampilan verifikasi di kontribusi/show.tsx (punya kontributor)
FILE: `resources/js/pages/kontribusi/show.tsx`
ACTION: EDIT TARGETED

Cari baris ini (persis):

```tsx
                        {/* Tags */}
```

Tepat SEBELUM baris itu, TAMBAHKAN blok baru ini:

```tsx
                        {/* Surat Pernyataan */}
                        {konten.surat_pernyataan_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">Surat Pernyataan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={konten.surat_pernyataan_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:border-primary/40"
                                    >
                                        <FileText className="size-5 text-muted-foreground" />
                                        <span>Lihat surat pernyataan yang sudah kamu unggah</span>
                                    </a>
                                </CardContent>
                            </Card>
                        )}

```

`FileText` dan `Card`/`CardHeader`/`CardContent`/`CardTitle` SUDAH di-import
di file ini, JANGAN tambah import baru. PERHATIAN: file ini punya section
"Tags" yang sama persis bentuknya di file `konten/show.tsx` (G.5) — pastikan
kamu edit file yang BENAR sesuai nama file di atas, jangan tertukar.

## G.5 — Tampilan verifikasi di konten/show.tsx (punya admin)
FILE: `resources/js/pages/konten/show.tsx`
ACTION: EDIT TARGETED

Cari baris yang SAMA PERSIS (`{/* Tags */}`) di file ini, lalu TAMBAHKAN
blok yang SAMA PERSIS seperti G.4 di atas, tepat sebelum baris itu. Teksnya
SAMA, gak perlu diubah ("Lihat surat pernyataan yang diunggah kontributor"
juga boleh, tapi versi G.4 di atas udah oke dipakai di kedua file).

# ════════════════════════════════════════════════════════════════════
# SECTION H — MIGRATE, SEED, & VERIFIKASI
# ════════════════════════════════════════════════════════════════════

## H.1 — Jalankan migration
```bash
php artisan migrate
```
HARUS sukses bikin tabel `surat_pernyataan` dan kolom
`surat_pernyataan_url` di `konten_budayas`.

## H.2 — Re-seed permission & role
```bash
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=RoleSeeder
```
WAJIB dijalankan — tanpa ini, permission `surat pernyataan edit` belum ada
di database dan halaman admin-nya bakal 403 ke semua orang termasuk admin.

## H.3 — Storage link
```bash
php artisan storage:link
```
(Kalau sebelumnya belum ada — cek dulu `public/storage` udah symlink atau
belum sebelum jalanin ulang, biar gak error "link already exists".)

## H.4 — Type check & lint
```bash
npm run types
npx eslint resources/js/pages/surat-pernyataan/edit.tsx resources/js/pages/kontribusi/create.tsx resources/js/pages/kontribusi/edit.tsx resources/js/pages/kontribusi/show.tsx resources/js/pages/konten/show.tsx resources/js/components/app-sidebar.tsx
```
HARUS 0 error baru dari file-file Phase 6. Total error `tsc` keseluruhan
boleh tetap di angka baseline (gak nambah) — JANGAN perbaiki error pre-
existing yang gak berhubungan.

## H.5 — Build
```bash
npm run build
```

## H.6 — Test manual di browser
- [ ] Login sebagai admin → menu sidebar ada "Surat Pernyataan" → upload PDF
  → berhasil, file ke-download dengan benar pas diklik "Lihat"
- [ ] Login sebagai user biasa (gak punya permission) → akses
  `/surat-pernyataan` langsung → HARUS 403
- [ ] Buka `/kontribusi/create` — ada section Surat Pernyataan di atas card
  "Siap Kirim?", tombol download berfungsi (download file PDF yang sama
  dengan yang admin upload)
- [ ] Coba submit form TANPA upload surat pernyataan → HARUS muncul error
  validasi, form gak terkirim
- [ ] Upload surat pernyataan (coba PDF, coba juga JPG) → submit → konten
  berhasil dibuat
- [ ] Admin buka halaman moderasi konten itu (`/konten/{slug}`) → ada card
  "Surat Pernyataan" dengan link ke file yang diupload kontributor
- [ ] Kontributor buka halaman detail konten miliknya sendiri
  (`/kontribusi/{slug}`) → card yang sama juga muncul di situ
- [ ] Konten yang ditolak admin → kontributor edit & kirim ulang TANPA ganti
  surat pernyataan → berhasil tersimpan, TIDAK error validasi (karena
  optional di update)
- [ ] Coba juga GANTI surat pernyataan pas edit → file lama ketimpa file
  baru, link di halaman verifikasi nunjuk ke file yang baru

## H.7 — Kalau ada yang gagal
STOP, jangan improvisasi sendiri. Laporkan ke user persis test mana yang
gagal dan kondisinya.

# ════════════════════════════════════════════════════════════════════
# LOG PERUBAHAN — DILAKUKAN OLEH CLAUDE CODE (2026-06-22)
# ════════════════════════════════════════════════════════════════════

Semua section A–H telah dieksekusi. Berikut ringkasan file yang dibuat/diubah:

## SECTION A — Migration (DIBUAT)
- `database/migrations/2026_06_22_000001_create_surat_pernyataan_table.php`
- `database/migrations/2026_06_22_000002_add_surat_pernyataan_url_to_konten_budayas_table.php`

## SECTION B — Model (DIBUAT/DIEDIT)
- `app/Models/SuratPernyataan.php` — dibuat baru (singleton pattern, `current()`, accessor `file_url`)
- `app/Models/KontenBudaya.php` — ditambahkan `'surat_pernyataan_url'` ke `$fillable`

## SECTION C — Service (DIBUAT/DIEDIT)
- `app/Services/SuratPernyataanService.php` — dibuat baru (upload template admin)
- `app/Services/MediaFileService.php` — ditambahkan method `storeSuratPernyataan()`

## SECTION D — Controller Admin (DIBUAT)
- `app/Http/Controllers/SuratPernyataanController.php` — dibuat baru (edit + update, middleware permission)

## SECTION E — Controller Kontribusi & Validasi (DIUPDATE)
- `app/Http/Controllers/KontribusiController.php` — ganti total: tambah `downloadSurat()`, `suratPernyataanAvailable` ke `create()`, call `storeSuratPernyataan()` di `store()` dan `update()`
- `app/Http/Requests/KontribusiRequest/StoreKontribusiRequest.php` — ganti total: tambah rule `surat_pernyataan` required
- `app/Http/Requests/KontribusiRequest/UpdateKontribusiRequest.php` — ganti total: tambah rule `surat_pernyataan` nullable

## SECTION F — Routing, Permission, Nav (DIEDIT)
- `routes/web.php` — ganti total: tambah route `kontribusi/surat-pernyataan/download` (SEBELUM resource), tambah route GET/POST `surat-pernyataan`
- `config/starterkit.php` — tambah permission `'surat pernyataan edit'`
- `resources/js/components/app-sidebar.tsx` — ganti total: tambah `FileSignature` icon, tambah nav item "Surat Pernyataan"
- `resources/js/types/index.d.ts` — tambah `surat_pernyataan_url: string | null` ke interface `KontenBudaya`

## SECTION G — Frontend (DIBUAT/DIEDIT)
- `resources/js/pages/surat-pernyataan/edit.tsx` — dibuat baru (folder baru, halaman admin kelola template)
- `resources/js/pages/kontribusi/create.tsx` — ganti total: tambah kolom kanan dengan card Surat Pernyataan + checklist item
- `resources/js/pages/kontribusi/edit.tsx` — ganti total: tambah card Surat Pernyataan opsional di kolom kanan
- `resources/js/pages/kontribusi/show.tsx` — edit targeted: tambah Card Surat Pernyataan sebelum `{/* Tags */}`
- `resources/js/pages/konten/show.tsx` — edit targeted: tambah Card Surat Pernyataan sebelum `{/* Tags */}`

## SECTION H — Migrasi, Seed, Build (DIJALANKAN)
- `php artisan migrate` — SUKSES (2 migration baru dijalankan)
- `php artisan db:seed --class=PermissionSeeder` — SUKSES
- `php artisan db:seed --class=RoleSeeder` — SUKSES
- `php artisan storage:link` — symlink sudah ada (skip)
- `npm run types` — SUKSES (0 TypeScript errors)
- `npm run build` — SUKSES (2759 modules, build selesai tanpa error)

