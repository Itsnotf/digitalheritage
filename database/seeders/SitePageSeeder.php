<?php

namespace Database\Seeders;

use App\Models\SitePage;
use Illuminate\Database\Seeder;

class SitePageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'key'      => 'beranda',
                'title'    => 'Beranda',
                'subtitle' => 'Platform Dokumentasi Budaya Sumatera Selatan',
                'content'  => [
                    'tagline' => 'Platform Dokumentasi Digital',
                ],
            ],
            [
                'key'      => 'galeri',
                'title'    => 'Galeri Budaya',
                'subtitle' => 'Jelajahi dokumentasi budaya dari seluruh Sumatera Selatan',
                'content'  => [
                    'tagline' => 'Dokumentasi Budaya Sumsel',
                ],
            ],
            [
                'key'      => 'tentang-kami',
                'title'    => 'Tentang Kami',
                'subtitle' => 'Mengenal Platform Budaya Sumsel',
                'content'  => [
                    'heading'          => 'Tentang Budaya Sumsel',
                    'intro'            => 'Platform Budaya Sumsel hadir sebagai wadah digital untuk mendokumentasikan, melestarikan, dan memperkenalkan kekayaan budaya Sumatera Selatan kepada khalayak luas, khususnya generasi muda.',
                    'visi'             => 'Menjadi platform terdepan dalam dokumentasi dan pelestarian budaya Sumatera Selatan yang modern, terintegrasi, dan mudah diakses oleh seluruh lapisan masyarakat.',
                    'misi_items'       => [
                        'Mendokumentasikan kekayaan budaya Sumatera Selatan secara sistematis dan terstruktur.',
                        'Melestarikan warisan leluhur dengan memanfaatkan teknologi digital modern.',
                        'Memberdayakan masyarakat sebagai kontributor aktif dalam proses pelestarian budaya.',
                        'Meningkatkan partisipasi generasi muda dalam mengenal dan menjaga identitas budaya daerah.',
                    ],
                    'section_1_title'   => 'Siapa Kami',
                    'section_1_content' => 'Kami adalah komunitas yang peduli terhadap pelestarian budaya Sumatera Selatan. Platform ini dibangun atas dasar keyakinan bahwa setiap budaya berharga dan layak untuk didokumentasikan serta diwariskan kepada generasi mendatang.',
                    'section_2_title'   => 'Mengapa Platform Ini',
                    'section_2_content' => 'Sumatera Selatan memiliki kekayaan budaya yang luar biasa — dari Tari Gending Sriwijaya, musik tradisional, hingga kuliner khas Pempek yang mendunia. Namun tanpa dokumentasi yang baik, warisan ini berisiko terlupakan. Platform ini hadir sebagai solusi.',
                ],
            ],
            [
                'key'      => 'kontak',
                'title'    => 'Kontak',
                'subtitle' => 'Hubungi kami untuk pertanyaan, kerjasama, atau saran',
                'content'  => [
                    'heading'         => 'Hubungi Kami',
                    'intro'           => 'Kami terbuka untuk segala bentuk pertanyaan, masukan, kerjasama, maupun pelaporan konten. Jangan ragu untuk menghubungi kami melalui salah satu saluran berikut.',
                    'alamat'          => 'Palembang, Sumatera Selatan, Indonesia',
                    'telepon'         => '-',
                    'email'           => 'info@budayasumsel.id',
                    'jam_operasional' => 'Senin – Jumat, 08.00 – 17.00 WIB',
                    'instagram'       => '',
                    'facebook'        => '',
                ],
            ],
        ];

        foreach ($pages as $page) {
            SitePage::updateOrCreate(
                ['key' => $page['key']],
                $page
            );
        }
    }
}
