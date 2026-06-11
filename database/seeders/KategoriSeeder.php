<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {
        $kategoris = [
            [
                'nama'      => 'Tarian Tradisional',
                'slug'      => 'tarian-tradisional',
                'deskripsi' => 'Ragam tarian khas daerah Sumatera Selatan yang merupakan ekspresi budaya dan identitas lokal.',
                'icon'      => 'music-4',
                'urutan'    => 1,
            ],
            [
                'nama'      => 'Musik Daerah',
                'slug'      => 'musik-daerah',
                'deskripsi' => 'Instrumen, lagu, dan tradisi musik dari berbagai wilayah di Sumatera Selatan.',
                'icon'      => 'music',
                'urutan'    => 2,
            ],
            [
                'nama'      => 'Rumah Adat',
                'slug'      => 'rumah-adat',
                'deskripsi' => 'Arsitektur tradisional dan rumah adat yang mencerminkan kearifan lokal Sumatera Selatan.',
                'icon'      => 'home',
                'urutan'    => 3,
            ],
            [
                'nama'      => 'Kuliner Khas',
                'slug'      => 'kuliner-khas',
                'deskripsi' => 'Masakan, minuman, dan jajanan tradisional yang menjadi ciri khas Sumatera Selatan.',
                'icon'      => 'utensils',
                'urutan'    => 4,
            ],
            [
                'nama'      => 'Pakaian Adat',
                'slug'      => 'pakaian-adat',
                'deskripsi' => 'Busana tradisional, aksesoris, dan pakaian adat dari berbagai daerah di Sumatera Selatan.',
                'icon'      => 'shirt',
                'urutan'    => 5,
            ],
            [
                'nama'      => 'Tradisi Lokal',
                'slug'      => 'tradisi-lokal',
                'deskripsi' => 'Adat istiadat, upacara, permainan tradisional, dan tradisi unik dari masyarakat Sumatera Selatan.',
                'icon'      => 'users',
                'urutan'    => 6,
            ],
        ];

        foreach ($kategoris as $kategori) {
            Category::create($kategori);
        }
    }
}
