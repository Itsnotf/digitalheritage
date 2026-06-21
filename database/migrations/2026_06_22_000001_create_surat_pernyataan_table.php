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
