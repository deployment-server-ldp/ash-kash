<?php

use App\Models\Setting;
use App\Services\CurrencyService;

if (! function_exists('currency')) {
    function currency(): CurrencyService
    {
        return app(CurrencyService::class);
    }
}

if (! function_exists('money')) {
    function money(float|string $baseAmount): string
    {
        return currency()->format($baseAmount);
    }
}

if (! function_exists('setting')) {
    function setting(string $key, mixed $default = null): mixed
    {
        return Setting::get($key, $default);
    }
}
