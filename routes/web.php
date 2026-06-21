<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KomentarController;
use App\Http\Controllers\KontenBudayaController;
use App\Http\Controllers\KontribusiController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\PublicKomentarController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SitePageController;
use App\Http\Controllers\SuratPernyataanController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WilayahController;
use Illuminate\Support\Facades\Route;

// -------------------------------------------------------
// Public — tidak perlu login
// -------------------------------------------------------
Route::get('/',              [PublicController::class, 'galeri'])->name('home');
Route::get('/galeri',        [PublicController::class, 'galeri'])->name('galeri.index');
Route::get('/galeri/{konten:slug}', [PublicController::class, 'show'])->name('galeri.show');
Route::get('/tentang-kami',  [PublicController::class, 'tentang'])->name('tentang');
Route::get('/kontak',        [PublicController::class, 'kontak'])->name('kontak');

// Auth required — rating dan komentar publik
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/galeri/{konten}/rating',   [RatingController::class, 'store'])->name('rating.store');
    Route::post('/galeri/{konten}/komentar', [PublicKomentarController::class, 'store'])->name('komentar.publik.store');
});

// -------------------------------------------------------
// Dashboard & fitur authenticated
// -------------------------------------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Kontribusi
    // Route literal HARUS di atas Route::resource, supaya 'surat-pernyataan'
    // gak ketangkep sebagai parameter {kontribusi} oleh route show.
    Route::get('kontribusi/surat-pernyataan/download', [KontribusiController::class, 'downloadSurat'])->name('kontribusi.surat-pernyataan.download');
    Route::resource('kontribusi', KontribusiController::class);
    Route::patch('kontribusi/{kontribusi}/revise',  [KontribusiController::class, 'respondRevise'])->name('kontribusi.revise');
    Route::patch('kontribusi/{kontribusi}/decline', [KontribusiController::class, 'respondDecline'])->name('kontribusi.decline');

    // Admin — moderasi konten
    Route::resource('konten', KontenBudayaController::class)->only(['index', 'show', 'destroy']);
    Route::patch('konten/{konten}/approve', [KontenBudayaController::class, 'approve'])->name('konten.approve');
    Route::patch('konten/{konten}/reject',  [KontenBudayaController::class, 'reject'])->name('konten.reject');

    // Admin — data master
    Route::resource('kategori', KategoriController::class);
    Route::resource('wilayah',  WilayahController::class);
    Route::resource('tag',      TagController::class);

    // Admin — komentar
    Route::get('komentar',                  [KomentarController::class, 'index'])->name('komentar.index');
    Route::patch('komentar/{comment}/hide', [KomentarController::class, 'hide'])->name('komentar.hide');
    Route::delete('komentar/{comment}',     [KomentarController::class, 'destroy'])->name('komentar.destroy');

    // Admin — manajemen halaman (CMS)
    Route::get('halaman',                          [SitePageController::class, 'index'])->name('halaman.index');
    Route::get('halaman/{page:key}/edit',          [SitePageController::class, 'edit'])->name('halaman.edit');
    Route::put('halaman/{page:key}',               [SitePageController::class, 'update'])->name('halaman.update');
    Route::post('halaman/{page:key}/hero',         [SitePageController::class, 'uploadHero'])->name('halaman.hero');
    Route::delete('halaman/{page:key}/hero',       [SitePageController::class, 'removeHero'])->name('halaman.hero.remove');

    // Admin — template surat pernyataan (singleton)
    Route::get('surat-pernyataan',  [SuratPernyataanController::class, 'edit'])->name('surat-pernyataan.edit');
    Route::post('surat-pernyataan', [SuratPernyataanController::class, 'update'])->name('surat-pernyataan.update');

    // User & role management
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
});

require __DIR__ . '/settings.php';
