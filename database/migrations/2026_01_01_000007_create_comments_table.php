<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('konten_id')
                  ->constrained('konten_budayas')
                  ->cascadeOnDelete();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Null = komentar utama, diisi = balasan komentar
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('comments')
                  ->cascadeOnDelete();

            $table->text('isi');

            // Admin bisa sembunyikan komentar yang tidak pantas
            $table->enum('status', ['aktif', 'tersembunyi'])->default('aktif');

            $table->timestamps();

            $table->index(['konten_id', 'parent_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
