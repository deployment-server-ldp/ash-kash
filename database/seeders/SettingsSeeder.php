<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'store_name' => 'Ash & Kash',
            'contact_email' => 'hello@ashkash.test',
            'contact_phone' => '+92 300 1234567',
            'contact_address' => 'Karachi, Pakistan',
            'social_instagram' => 'ashkash',
            'social_facebook' => 'ashkash',
            'footer_about' => 'Premium women\'s fashion — thoughtfully designed, beautifully made.',
            'footer_copyright' => '© '.date('Y').' Ash & Kash. All rights reserved.',
            'cod_enabled' => '1',
            'free_shipping_note' => '3-7 business days',
            'seo_default_title' => 'Ash & Kash — Premium Women\'s Fashion Boutique',
            'seo_default_description' => 'Shop the latest in women\'s fashion — new arrivals, ready-to-wear and luxury pieces. Cash on Delivery available.',
            'newsletter_provider' => 'none',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => 'general']);
        }
    }
}
