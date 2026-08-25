<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['name' => 'Pakistani Rupee', 'code' => 'PKR', 'symbol' => 'Rs. ', 'exchange_rate' => 1, 'decimal_places' => 0, 'is_default' => true],
            ['name' => 'US Dollar', 'code' => 'USD', 'symbol' => '$', 'exchange_rate' => 0.0036, 'decimal_places' => 2],
            ['name' => 'Indian Rupee', 'code' => 'INR', 'symbol' => '₹', 'exchange_rate' => 0.30, 'decimal_places' => 0],
            ['name' => 'UAE Dirham', 'code' => 'AED', 'symbol' => 'AED ', 'exchange_rate' => 0.0132, 'decimal_places' => 2],
            ['name' => 'Saudi Riyal', 'code' => 'SAR', 'symbol' => 'SAR ', 'exchange_rate' => 0.0135, 'decimal_places' => 2],
            ['name' => 'Qatari Riyal', 'code' => 'QAR', 'symbol' => 'QAR ', 'exchange_rate' => 0.0131, 'decimal_places' => 2],
            ['name' => 'Kuwaiti Dinar', 'code' => 'KWD', 'symbol' => 'KD ', 'exchange_rate' => 0.00110, 'decimal_places' => 3],
            ['name' => 'Omani Rial', 'code' => 'OMR', 'symbol' => 'OMR ', 'exchange_rate' => 0.00138, 'decimal_places' => 3],
            ['name' => 'Bahraini Dinar', 'code' => 'BHD', 'symbol' => 'BD ', 'exchange_rate' => 0.00135, 'decimal_places' => 3],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(
                ['code' => $currency['code']],
                $currency + ['symbol_position' => 'before', 'is_active' => true]
            );
        }
    }
}
