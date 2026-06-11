<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    'pagination' => 8,

    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

    'roles' => [
        'admin',
        'user',
    ],

    'default_admin_role' => 'admin',

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    | Format: '<resource> <action>' => '<human readable label>'
    */

    'permissions' => [
        // -------------------------------------------------------
        // User & Role Management (sudah ada)
        // -------------------------------------------------------
        'users index'  => 'View Users',
        'users create' => 'Create User',
        'users edit'   => 'Edit User',
        'users delete' => 'Delete User',
        'roles index'  => 'View Roles',
        'roles create' => 'Create Role',
        'roles edit'   => 'Edit Role',
        'roles delete' => 'Delete Role',

        // -------------------------------------------------------
        // Konten Budaya — hak akses admin untuk moderasi
        // -------------------------------------------------------
        'konten index'    => 'Lihat Semua Konten',
        'konten validate' => 'Validasi Konten (Setujui/Tolak)',
        'konten delete'   => 'Hapus Konten',

        // -------------------------------------------------------
        // Kategori Budaya
        // -------------------------------------------------------
        'kategori index'  => 'Lihat Kategori',
        'kategori create' => 'Tambah Kategori',
        'kategori edit'   => 'Edit Kategori',
        'kategori delete' => 'Hapus Kategori',

        // -------------------------------------------------------
        // Wilayah (Kabupaten/Kota)
        // -------------------------------------------------------
        'wilayah index'   => 'Lihat Wilayah',
        'wilayah create'  => 'Tambah Wilayah',
        'wilayah edit'    => 'Edit Wilayah',
        'wilayah delete'  => 'Hapus Wilayah',

        // -------------------------------------------------------
        // Tag
        // -------------------------------------------------------
        'tag index'  => 'Lihat Tag',
        'tag create' => 'Tambah Tag',
        'tag edit'   => 'Edit Tag',
        'tag delete' => 'Hapus Tag',

        // -------------------------------------------------------
        // Komentar — moderasi komentar
        // -------------------------------------------------------
        'komentar index'  => 'Lihat Semua Komentar',
        'komentar delete' => 'Hapus/Sembunyikan Komentar',

        // -------------------------------------------------------
        // Manajemen Halaman (CMS)
        // -------------------------------------------------------
        'halaman index' => 'Lihat Daftar Halaman',
        'halaman edit'  => 'Edit Konten Halaman',

        // -------------------------------------------------------
        // Monitoring — statistik dan aktivitas platform
        // -------------------------------------------------------
        'monitoring index' => 'Lihat Monitoring Aktivitas',
    ],

];
