<?php

use App\Http\Middleware\CustomerAuth;
use App\Http\Middleware\DetectCurrency;
use App\Http\Middleware\RedirectIfCustomerAuthenticated;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            DetectCurrency::class,
        ]);

        $middleware->alias([
            'customer' => CustomerAuth::class,
            'guest.customer' => RedirectIfCustomerAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
