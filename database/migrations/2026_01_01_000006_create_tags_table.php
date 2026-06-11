<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('konten_tags', function (Blueprint $table) {
            $table->foreignId('konten_id')
                  ->constrained('konten_budayas')
                  ->cascadeOnDelete();
            $table->foreignId('tag_id')
                  ->constrained('tags')
                  ->cascadeOnDelete();

            $table->primary(['konten_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('konten_tags');
        Schema::dropIfExists('tags');
    }
};
