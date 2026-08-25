<?php

namespace Database\Seeders;

use App\Models\HomepageSection;
use App\Support\PlaceholderImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class HomepageSectionSeeder extends Seeder
{
    public function run(): void
    {
        $storyImage = PlaceholderImage::make('Our Story', 9, 900, 1125);
        Storage::disk('public')->put('homepage/brand-story.jpg', file_get_contents($storyImage));
        @unlink($storyImage);

        $sections = [
            ['type' => 'hero_slider', 'sort_order' => 0],
            [
                'type' => 'categories', 'title' => 'Shop by Category', 'subtitle' => 'Find your perfect piece', 'sort_order' => 1,
            ],
            [
                'type' => 'featured_products', 'title' => 'Featured This Week', 'subtitle' => 'Hand-picked by our stylists',
                'settings' => ['source' => 'featured', 'limit' => 8], 'button_text' => 'View All', 'sort_order' => 2,
            ],
            [
                'type' => 'promo_banner', 'title' => 'Cash on Delivery Available', 'subtitle' => 'Shop with confidence, pay when it arrives.',
                'button_text' => 'Shop Now', 'button_url' => '/shop', 'sort_order' => 3,
            ],
            [
                'type' => 'featured_products', 'title' => 'Best Sellers', 'subtitle' => 'Loved by our customers',
                'settings' => ['source' => 'best_seller', 'limit' => 4], 'button_text' => 'Shop Best Sellers', 'sort_order' => 4,
            ],
            ['type' => 'collections', 'title' => 'Curated Collections', 'subtitle' => 'Shop the edit', 'sort_order' => 5],
            [
                'type' => 'brand_story', 'title' => 'Our Story', 'subtitle' => 'Est. Boutique',
                'content' => 'Ash & Kash was founded on the belief that every woman deserves clothing that makes her feel effortlessly confident. Each piece is thoughtfully designed and crafted with premium fabrics, blending timeless silhouettes with modern details.',
                'image' => 'homepage/brand-story.jpg', 'button_text' => 'Learn More', 'sort_order' => 6,
            ],
            ['type' => 'testimonials', 'title' => 'What Our Customers Say', 'sort_order' => 7],
            ['type' => 'instagram', 'title' => '@ashkash', 'subtitle' => 'Follow us for style inspiration', 'sort_order' => 8],
            [
                'type' => 'newsletter', 'title' => 'Join the Inner Circle',
                'subtitle' => 'Sign up for early access to new collections and exclusive offers.', 'sort_order' => 9,
            ],
        ];

        foreach ($sections as $section) {
            HomepageSection::updateOrCreate(
                ['type' => $section['type'], 'sort_order' => $section['sort_order']],
                $section + ['is_active' => true]
            );
        }
    }
}
