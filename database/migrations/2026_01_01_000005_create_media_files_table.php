<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();

            $table->foreignId('konten_id')
                  ->constrained('konten_budayas')
                  ->cascadeOnDelete();

            // Tipe file untuk menentukan cara render dan batasan
            $table->enum('tipe', ['image', 'video', 'audio', 'document']);

            // Path file di storage (relatif ke storage/app/public)
            $table->string('url');

            // Nama file asli dari user (untuk display)
            $table->string('filename');

            // MIME type (image/jpeg, video/mp4, audio/mp3, application/pdf, dll)
            $table->string('mime_type');

            // Ukuran dalam KB
            $table->unsignedInteger('ukuran_kb');

            // Durasi dalam detik (untuk audio dan video)
            $table->unsignedInteger('durasi_detik')->nullable();

            // URL thumbnail yang di-generate otomatis:
            // - image  → sama dengan url
            // - video  → frame pertama (diproses background job)
            // - audio  → waveform image (diproses background job)
            // - document → render halaman pertama PDF
            $table->string('thumbnail_url')->nullable();

            // Flag file utama — yang ini dipakai sebagai cover_url di konten
            // Hanya satu file per konten yang boleh is_primary = true
            $table->boolean('is_primary')->default(false);

            // Urutan tampil di galeri konten
            $table->unsignedInteger('urutan')->default(0);

            $table->timestamps();

            $table->index(['konten_id', 'urutan']);
            $table->index(['konten_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_files');
    }
};
