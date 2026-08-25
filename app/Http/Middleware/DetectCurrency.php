<?php

namespace App\Http\Middleware;

use App\Services\CurrencyService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets a display currency on first visit (IP-based, best effort) without
 * ever overriding a currency the visitor picked manually via the selector.
 */
class DetectCurrency
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Session::has(CurrencyService::SESSION_KEY)) {
            $service = app(CurrencyService::class);
            $iso2 = $service->detectCountryFromIp($request);
            $currency = $service->forCountry($iso2) ?? $service->default();
            $service->setCurrent($currency->code);
        }

        return $next($request);
    }
}
