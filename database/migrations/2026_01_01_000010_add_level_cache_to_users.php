<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Counter cache untuk menghitung konten yang disetujui.
            // Di-increment saat admin approve, dipakai untuk kalkulasi level.
            $table->unsignedInteger('approved_konten_count')
                  ->default(0)
                  ->after('wilayah_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('approved_konten_count');
        });
    }
};
