<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moderation_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('konten_id')
                  ->constrained('konten_budayas')
                  ->cascadeOnDelete();

            // Pelaku aksi — bisa admin (approve/reject) atau user (user_revise/user_decline)
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Aksi yang dilakukan:
            // approve       → admin menyetujui konten
            // reject        → admin menolak konten (catatan wajib diisi)
            // user_revise   → user memilih untuk merevisi setelah ditolak
            // user_decline  → user memilih untuk tidak merevisi (reject final)
            $table->enum('aksi', ['approve', 'reject', 'user_revise', 'user_decline']);

            // Wajib diisi saat aksi = reject, opsional untuk yang lain
            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->index(['konten_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderation_logs');
    }
};
