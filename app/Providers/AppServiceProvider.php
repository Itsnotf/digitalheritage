<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Auto-assign role 'user' ke setiap akun yang baru registrasi.
        // Tanpa ini, user baru tidak punya role apapun dan permission check Spatie akan gagal.
        Event::listen(function (Registered $event) {
            $event->user->assignRole('user');
        });
    }
}
