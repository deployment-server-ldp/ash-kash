<?php

namespace App\Services;

use App\Models\Country;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Stevebauman\Location\Facades\Location;

/**
 * Central place for the currency architecture.
 *
 * All prices in the database (products, orders, cart items, shipping) are
 * stored in the store's BASE currency (set via `settings.base_currency_code`,
 * defaults to PKR). This service is the only place that converts a base
 * amount into the visitor's DISPLAY currency, using the admin-configured
 * exchange rate on the `currencies` table. Nothing in the frontend should
 * hard-code a rate or a symbol.
 */
class CurrencyService
{
    public const SESSION_KEY = 'display_currency_code';

    public function baseCurrencyCode(): string
    {
        return config('shop.base_currency', 'PKR');
    }

    public function baseCurrency(): ?Currency
    {
        return Currency::query()->where('code', $this->baseCurrencyCode())->first();
    }

    public function all()
    {
        return Currency::query()->active()->orderBy('code')->get();
    }

    public function current(): Currency
    {
        $code = Session::get(self::SESSION_KEY);

        if ($code) {
            $currency = Currency::query()->where('code', $code)->where('is_active', true)->first();
            if ($currency) {
                return $currency;
            }
        }

        return $this->default();
    }

    public function default(): Currency
    {
        return Currency::query()->where('is_default', true)->first()
            ?? Currency::query()->where('code', $this->baseCurrencyCode())->first()
            ?? Currency::query()->first()
            ?? $this->fallbackCurrency();
    }

    /**
     * Used only if the `currencies` table hasn't been seeded yet, so the storefront
     * never hard-crashes on a fresh install before `php artisan db:seed` has run.
     */
    protected function fallbackCurrency(): Currency
    {
        return new Currency([
            'name' => 'Pakistani Rupee',
            'code' => $this->baseCurrencyCode(),
            'symbol' => 'Rs. ',
            'exchange_rate' => 1,
            'decimal_places' => 0,
            'symbol_position' => 'before',
            'thousands_separator' => ',',
            'decimal_separator' => '.',
            'is_default' => true,
            'is_active' => true,
        ]);
    }

    public function setCurrent(string $code): void
    {
        Session::put(self::SESSION_KEY, strtoupper($code));
    }

    /**
     * Detect a currency from a 2-letter ISO country code via the admin's
     * country -> currency mapping. Returns null if no mapping exists.
     */
    public function forCountry(?string $iso2): ?Currency
    {
        if (! $iso2) {
            return null;
        }

        return Country::query()->where('iso2', strtoupper($iso2))->first()?->currency;
    }

    /**
     * Convert a base-currency amount into the given (or current) display currency.
     */
    public function convert(float|string $baseAmount, ?Currency $currency = null): float
    {
        $currency ??= $this->current();
        $amount = (float) $baseAmount * (float) $currency->exchange_rate;

        return round($amount, $currency->decimal_places);
    }

    /**
     * Convert + format for display, e.g. "PKR 12,500" or "$45.00".
     */
    public function format(float|string $baseAmount, ?Currency $currency = null): string
    {
        $currency ??= $this->current();
        $converted = $this->convert($baseAmount, $currency);

        $formatted = number_format(
            $converted,
            $currency->decimal_places,
            $currency->decimal_separator,
            $currency->thousands_separator
        );

        return $currency->symbol_position === 'before'
            ? $currency->symbol.$formatted
            : $formatted.$currency->symbol;
    }

    /**
     * Best-effort IP based country detection (never fatal — falls back to config default).
     */
    public function detectCountryFromIp(Request $request): string
    {
        try {
            $position = Location::get($request->ip());
            if ($position && ! empty($position->countryCode)) {
                return strtoupper($position->countryCode);
            }
        } catch (\Throwable $e) {
            // Geolocation providers can fail (offline, rate limited, local IP) — never break the request.
        }

        return config('shop.default_country', 'PK');
    }
}
