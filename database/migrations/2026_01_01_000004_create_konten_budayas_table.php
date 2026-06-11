<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('konten_budayas', function (Blueprint $table) {
            $table->id();

            // Relasi ke pemilik konten
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Relasi ke kategori dan wilayah
            $table->foreignId('category_id')
                  ->constrained('categories')
                  ->restrictOnDelete();
            $table->foreignId('wilayah_id')
                  ->constrained('wilayah')
                  ->restrictOnDelete();

            // Konten utama
            $table->string('judul');
            $table->string('slug')->unique();
            $table->text('deskripsi');

            // Status moderasi: pending → published atau rejected
            // Jika rejected, user bisa pilih revisi (kembali ke pending) atau tidak
            $table->enum('status', ['pending', 'published', 'rejected'])->default('pending');
            $table->text('catatan_admin')->nullable(); // wajib diisi saat reject

            // Thumbnail utama yang tampil di kartu konten
            // Di-set otomatis dari media_file is_primary, bisa di-override user
            $table->string('cover_url')->nullable();

            // Statistik
            $table->unsignedInteger('view_count')->default(0);

            // Data moderasi (diisi saat admin approve)
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            // Index untuk query yang sering dipakai
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index('category_id');
            $table->index('wilayah_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konten_budayas');
    }
};
