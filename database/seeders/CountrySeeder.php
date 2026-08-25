<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\Currency;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            ['name' => 'Pakistan', 'iso2' => 'PK', 'phone_code' => '+92', 'currency' => 'PKR'],
            ['name' => 'India', 'iso2' => 'IN', 'phone_code' => '+91', 'currency' => 'INR'],
            ['name' => 'United States', 'iso2' => 'US', 'phone_code' => '+1', 'currency' => 'USD'],
            ['name' => 'United Kingdom', 'iso2' => 'GB', 'phone_code' => '+44', 'currency' => 'USD'],
            ['name' => 'United Arab Emirates', 'iso2' => 'AE', 'phone_code' => '+971', 'currency' => 'AED'],
            ['name' => 'Saudi Arabia', 'iso2' => 'SA', 'phone_code' => '+966', 'currency' => 'SAR'],
            ['name' => 'Qatar', 'iso2' => 'QA', 'phone_code' => '+974', 'currency' => 'QAR'],
            ['name' => 'Kuwait', 'iso2' => 'KW', 'phone_code' => '+965', 'currency' => 'KWD'],
            ['name' => 'Oman', 'iso2' => 'OM', 'phone_code' => '+968', 'currency' => 'OMR'],
            ['name' => 'Bahrain', 'iso2' => 'BH', 'phone_code' => '+973', 'currency' => 'BHD'],
            ['name' => 'Canada', 'iso2' => 'CA', 'phone_code' => '+1', 'currency' => 'USD'],
            ['name' => 'Australia', 'iso2' => 'AU', 'phone_code' => '+61', 'currency' => 'USD'],
        ];

        foreach ($map as $row) {
            $currency = Currency::where('code', $row['currency'])->first();

            Country::updateOrCreate(
                ['iso2' => $row['iso2']],
                ['name' => $row['name'], 'phone_code' => $row['phone_code'], 'currency_id' => $currency?->id, 'is_active' => true]
            );
        }
    }
}
