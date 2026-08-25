<?php

return [
    // The currency all prices are entered/stored in throughout the admin (products, shipping, orders).
    'base_currency' => env('SHOP_BASE_CURRENCY', 'PKR'),

    // Fallback country (ISO2) used when IP geolocation cannot resolve a visitor's country.
    'default_country' => env('SHOP_DEFAULT_COUNTRY', 'PK'),

    'cod_enabled' => env('SHOP_COD_ENABLED', true),

    'name' => env('APP_NAME', 'Ash & Kash'),
];
