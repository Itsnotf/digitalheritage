<?php

namespace Database\Seeders;

use App\Models\Wilayah;
use Illuminate\Database\Seeder;

class WilayahSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            // 4 Kota
            ['nama' => 'Kota Palembang',      'tipe' => 'kota'],
            ['nama' => 'Kota Prabumulih',      'tipe' => 'kota'],
            ['nama' => 'Kota Pagar Alam',      'tipe' => 'kota'],
            ['nama' => 'Kota Lubuklinggau',    'tipe' => 'kota'],

            // 13 Kabupaten
            ['nama' => 'Kabupaten Musi Banyuasin',              'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Banyuasin',                   'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Musi Rawas',                  'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Musi Rawas Utara',            'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Muara Enim',                  'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Lahat',                       'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Empat Lawang',                'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Ogan Komering Ulu',           'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten OKU Timur',                   'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten OKU Selatan',                 'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Ogan Komering Ilir',          'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Ogan Ilir',                   'tipe' => 'kabupaten'],
            ['nama' => 'Kabupaten Penukal Abab Lematang Ilir',  'tipe' => 'kabupaten'],
        ];

        foreach ($data as $item) {
            Wilayah::create($item);
        }
    }
}
