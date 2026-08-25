<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Pakistan',
                'countries' => ['PK'],
                'methods' => [
                    ['name' => 'Standard Delivery', 'price' => 250, 'free_shipping_threshold' => 5000, 'estimated_days_min' => 2, 'estimated_days_max' => 4],
                    ['name' => 'Express Delivery', 'price' => 600, 'free_shipping_threshold' => null, 'estimated_days_min' => 1, 'estimated_days_max' => 1],
                ],
            ],
            [
                'name' => 'UAE',
                'countries' => ['AE'],
                'methods' => [
                    ['name' => 'Standard Delivery', 'price' => 1500, 'free_shipping_threshold' => 15000, 'estimated_days_min' => 3, 'estimated_days_max' => 6],
                ],
            ],
            [
                'name' => 'Saudi Arabia',
                'countries' => ['SA'],
                'methods' => [
                    ['name' => 'Standard Delivery', 'price' => 1600, 'free_shipping_threshold' => 15000, 'estimated_days_min' => 3, 'estimated_days_max' => 6],
                ],
            ],
            [
                'name' => 'India',
                'countries' => ['IN'],
                'methods' => [
                    ['name' => 'Standard Delivery', 'price' => 500, 'free_shipping_threshold' => 8000, 'estimated_days_min' => 4, 'estimated_days_max' => 8],
                ],
            ],
            [
                'name' => 'USA',
                'countries' => ['US'],
                'methods' => [
                    ['name' => 'Standard Delivery', 'price' => 4500, 'free_shipping_threshold' => 25000, 'estimated_days_min' => 5, 'estimated_days_max' => 10],
                ],
            ],
            [
                'name' => 'Rest of World',
                'countries' => ['*'],
                'methods' => [
                    ['name' => 'International Delivery', 'price' => 5000, 'free_shipping_threshold' => 30000, 'estimated_days_min' => 7, 'estimated_days_max' => 14],
                ],
            ],
        ];

        foreach ($zones as $i => $zoneData) {
            $zone = ShippingZone::updateOrCreate(
                ['name' => $zoneData['name']],
                ['countries' => $zoneData['countries'], 'is_active' => true, 'sort_order' => $i]
            );

            foreach ($zoneData['methods'] as $j => $method) {
                $zone->methods()->updateOrCreate(
                    ['name' => $method['name']],
                    $method + ['is_active' => true, 'sort_order' => $j]
                );
            }
        }
    }
}
