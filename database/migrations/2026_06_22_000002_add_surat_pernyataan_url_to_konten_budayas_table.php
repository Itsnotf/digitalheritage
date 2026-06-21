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
