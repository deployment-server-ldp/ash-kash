<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            ['code' => 'WELCOME10', 'type' => 'percentage', 'amount' => 10, 'first_order_only' => true, 'usage_limit_per_customer' => 1],
            ['code' => 'SAVE1500', 'type' => 'fixed', 'amount' => 1500, 'min_order_amount' => 10000],
            ['code' => 'FREESHIP', 'type' => 'free_shipping', 'amount' => 0, 'min_order_amount' => 5000],
        ];

        foreach ($coupons as $data) {
            Coupon::updateOrCreate(
                ['code' => $data['code']],
                $data + [
                    'applies_to' => 'all',
                    'start_date' => now()->subDays(5),
                    'end_date' => now()->addMonths(3),
                    'usage_limit' => 500,
                    'is_active' => true,
                ]
            );
        }
    }
}
