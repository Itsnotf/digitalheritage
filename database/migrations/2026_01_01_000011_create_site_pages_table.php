<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_pages', function (Blueprint $table) {
            $table->id();

            // Identifier unik per halaman
            $table->string('key')->unique();          // 'beranda', 'galeri', 'tentang-kami', 'kontak'

            // Judul dan subtitle untuk meta/SEO
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();

            // Hero image — path di storage/app/public/pages/
            $table->string('hero_image')->nullable();

            // Konten halaman dalam format JSON — berbeda per halaman
            // tentang-kami: { heading, intro, visi, misi_items[], section_1, section_2 }
            // kontak: { heading, intro, alamat, telepon, email, jam_ops, instagram, facebook }
            // beranda/galeri: { tagline }
            $table->json('content')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_pages');
    }
};
