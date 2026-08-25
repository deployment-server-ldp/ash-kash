<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Page;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $header = Menu::updateOrCreate(['location' => 'header'], ['name' => 'Header Menu']);
        $header->allItems()->delete();

        $shop = $header->allItems()->create(['label' => 'Shop', 'type' => 'custom', 'url' => '/shop', 'sort_order' => 1, 'is_active' => true]);

        foreach (Category::active()->root()->orderBy('sort_order')->get() as $i => $category) {
            $shop->children()->create([
                'menu_id' => $header->id,
                'label' => $category->name,
                'type' => 'category',
                'category_id' => $category->id,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $header->allItems()->create(['label' => 'New Arrivals', 'type' => 'custom', 'url' => '/category/new-arrivals', 'sort_order' => 2, 'is_active' => true]);
        $header->allItems()->create(['label' => 'Collections', 'type' => 'custom', 'url' => '/shop', 'sort_order' => 3, 'is_active' => true]);
        $header->allItems()->create(['label' => 'Journal', 'type' => 'custom', 'url' => '/blog', 'sort_order' => 4, 'is_active' => true]);
        $header->allItems()->create(['label' => 'About', 'type' => 'custom', 'url' => '/about', 'sort_order' => 5, 'is_active' => true]);
        $header->allItems()->create(['label' => 'Contact', 'type' => 'custom', 'url' => '/contact', 'sort_order' => 6, 'is_active' => true]);

        $footer = Menu::updateOrCreate(['location' => 'footer'], ['name' => 'Footer Menu']);
        $footer->allItems()->delete();

        $pages = Page::all()->keyBy('slug');
        $i = 0;
        foreach (['shipping-policy' => 'Shipping Policy', 'return-policy' => 'Return Policy', 'privacy-policy' => 'Privacy Policy', 'terms-conditions' => 'Terms & Conditions', 'faq' => 'FAQ'] as $slug => $label) {
            $page = $pages->get($slug);
            $footer->allItems()->create([
                'label' => $label,
                'type' => $page ? 'page' : 'custom',
                'page_id' => $page?->id,
                'url' => $page ? null : '/pages/'.$slug,
                'sort_order' => $i++,
                'is_active' => true,
            ]);
        }
    }
}
