<?php

namespace App\Providers;

use App\Mail\Transport\InternalRelayTransport;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->register(\L5Swagger\L5SwaggerServiceProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Mail::extend('internal_relay', function (array $config) {
            return new InternalRelayTransport(
                $config['endpoint'],
                $config['api_key'],
            );
        });
    }
}
