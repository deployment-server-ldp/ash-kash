<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            'about-us' => ['title' => 'About Us', 'content' => '<p>Ash & Kash is a premium women\'s fashion boutique dedicated to timeless, effortless style. Every piece is designed with intention and crafted from premium fabrics.</p>'],
            'privacy-policy' => ['title' => 'Privacy Policy', 'content' => '<p>We respect your privacy. Your personal information is only used to process orders and improve your shopping experience, and is never sold to third parties.</p>'],
            'terms-conditions' => ['title' => 'Terms & Conditions', 'content' => '<p>By using this website you agree to our terms of service. All content, designs and imagery are property of Ash & Kash.</p>'],
            'shipping-policy' => ['title' => 'Shipping Policy', 'content' => '<p>We offer Cash on Delivery across Pakistan and select international destinations. Delivery times vary by shipping zone — see checkout for estimated delivery.</p>'],
            'return-policy' => ['title' => 'Return Policy', 'content' => '<p>Returns are accepted within 7 days of delivery for unused items in original packaging. Contact our customer service team to initiate a return.</p>'],
            'faq' => ['title' => 'FAQ', 'content' => '<p><strong>Do you offer Cash on Delivery?</strong> Yes, on all domestic and most international orders.</p><p><strong>How long does delivery take?</strong> 2-14 business days depending on your location.</p>'],
        ];

        foreach ($pages as $slug => $data) {
            Page::updateOrCreate(
                ['slug' => $slug],
                $data + ['seo_title' => $data['title'].' | Ash & Kash', 'is_published' => true]
            );
        }
    }
}
