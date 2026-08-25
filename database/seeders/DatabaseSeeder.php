<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with demo/seed data.
     * All demo records are flagged `is_demo = true` where applicable so they
     * can be identified and removed before going to production.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            SettingsSeeder::class,
            CurrencySeeder::class,
            CountrySeeder::class,
            ShippingSeeder::class,
            SizeGuideSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            CollectionSeeder::class,
            CouponSeeder::class,
            SliderSeeder::class,
            PageSeeder::class,
            MenuSeeder::class,
            HomepageSectionSeeder::class,
            BlogSeeder::class,
            TestimonialSeeder::class,
            CustomerSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
