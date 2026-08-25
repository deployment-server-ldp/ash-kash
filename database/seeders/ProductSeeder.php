<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\SizeGuide;
use App\Models\Tag;
use App\Support\PlaceholderImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    protected array $colorSwatches = [
        'Black' => '#1b1815',
        'Ivory' => '#f3ecdd',
        'Blush' => '#e8c4bc',
        'Camel' => '#c69847',
        'Emerald' => '#2f5c4c',
        'Burgundy' => '#6b2737',
        'Beige' => '#e4cd9b',
        'Navy' => '#233450',
    ];

    public function run(): void
    {
        $brand = Brand::updateOrCreate(['slug' => 'ash-kash-atelier'], ['name' => 'Ash & Kash Atelier', 'is_active' => true]);
        $sizeGuide = SizeGuide::first();

        $tagNames = ['Silk', 'Linen', 'Formal', 'Casual', 'Occasionwear', 'Handcrafted', 'Limited Edition'];
        $tags = collect($tagNames)->mapWithKeys(fn ($name) => [
            $name => Tag::updateOrCreate(['slug' => Str::slug($name)], ['name' => $name]),
        ]);

        $categories = Category::all()->keyBy('slug');

        $products = [
            ['name' => 'Ivory Silk Wrap Dress', 'category' => 'new-arrivals', 'price' => 12500, 'compare' => 15900, 'badge' => 'NEW', 'featured' => true, 'new' => true, 'colors' => ['Ivory', 'Blush']],
            ['name' => 'Camel Tailored Blazer', 'category' => 'ready-to-wear', 'price' => 15900, 'compare' => null, 'featured' => true, 'colors' => ['Camel', 'Black']],
            ['name' => 'Emerald Velvet Gown', 'category' => 'luxury-collection', 'price' => 34500, 'compare' => 42000, 'badge' => 'LIMITED', 'sale' => true, 'colors' => ['Emerald', 'Burgundy']],
            ['name' => 'Linen Midi Shirt Dress', 'category' => 'ready-to-wear', 'price' => 9800, 'compare' => null, 'colors' => ['Beige', 'Navy']],
            ['name' => 'Burgundy Satin Slip Dress', 'category' => 'new-arrivals', 'price' => 13200, 'compare' => 16800, 'new' => true, 'sale' => true, 'colors' => ['Burgundy', 'Black']],
            ['name' => 'Beige Cashmere Sweater', 'category' => 'ready-to-wear', 'price' => 11400, 'compare' => null, 'bestSeller' => true, 'colors' => ['Beige', 'Ivory']],
            ['name' => 'Black Sculpted Evening Gown', 'category' => 'luxury-collection', 'price' => 38900, 'compare' => null, 'badge' => 'TRENDING', 'featured' => true, 'colors' => ['Black']],
            ['name' => 'Navy Pleated Midi Skirt', 'category' => 'ready-to-wear', 'price' => 7600, 'compare' => 9200, 'sale' => true, 'colors' => ['Navy', 'Camel']],
            ['name' => 'Blush Organza Cocktail Dress', 'category' => 'new-arrivals', 'price' => 16800, 'compare' => null, 'new' => true, 'colors' => ['Blush', 'Ivory']],
            ['name' => 'Ivory Lace Bridal Gown', 'category' => 'luxury-collection', 'price' => 65000, 'compare' => 78000, 'badge' => 'LIMITED', 'sale' => true, 'colors' => ['Ivory']],
            ['name' => 'Camel Wool Trench Coat', 'category' => 'ready-to-wear', 'price' => 21900, 'compare' => null, 'bestSeller' => true, 'colors' => ['Camel', 'Black']],
            ['name' => 'Emerald Silk Blouse', 'category' => 'new-arrivals', 'price' => 8400, 'compare' => null, 'new' => true, 'colors' => ['Emerald', 'Ivory']],
            ['name' => 'Black Tailored Trousers', 'category' => 'ready-to-wear', 'price' => 8900, 'compare' => null, 'bestSeller' => true, 'colors' => ['Black', 'Navy']],
            ['name' => 'Burgundy Velvet Blazer Dress', 'category' => 'luxury-collection', 'price' => 28900, 'compare' => 33500, 'sale' => true, 'colors' => ['Burgundy']],
            ['name' => 'Beige Linen Wide-Leg Set', 'category' => 'ready-to-wear', 'price' => 13900, 'compare' => null, 'colors' => ['Beige', 'Camel']],
            ['name' => 'Ivory Draped Column Gown', 'category' => 'luxury-collection', 'price' => 41200, 'compare' => null, 'featured' => true, 'colors' => ['Ivory', 'Blush']],
            ['name' => 'Navy Silk Slip Skirt', 'category' => 'new-arrivals', 'price' => 6900, 'compare' => 8500, 'new' => true, 'sale' => true, 'colors' => ['Navy', 'Black']],
            ['name' => 'Black Structured Handbag', 'category' => 'ready-to-wear', 'price' => 17500, 'compare' => null, 'bestSeller' => true, 'colors' => ['Black', 'Camel']],
        ];

        foreach ($products as $i => $data) {
            $category = $categories->get($data['category']);
            $sku = 'AK-'.strtoupper(Str::random(6));

            $product = Product::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'category_id' => $category?->id,
                    'brand_id' => $brand->id,
                    'size_guide_id' => $sizeGuide?->id,
                    'name' => $data['name'],
                    'sku' => $sku,
                    'description' => '<p>'.$data['name'].' — thoughtfully tailored in premium fabric with meticulous attention to detail. Designed for the modern woman who values timeless elegance.</p><p>Fabric: Premium blend. Care: Dry clean only.</p>',
                    'short_description' => 'A refined essential from the '.($category?->name ?? 'collection').' edit.',
                    'price' => $data['price'],
                    'compare_at_price' => $data['compare'] ?? null,
                    'cost_price' => round($data['price'] * 0.45),
                    'tax_rate' => 0,
                    'track_inventory' => true,
                    'inventory_quantity' => 0,
                    'low_stock_threshold' => 5,
                    'weight' => 0.6,
                    'status' => 'active',
                    'is_featured' => $data['featured'] ?? false,
                    'is_best_seller' => $data['bestSeller'] ?? false,
                    'is_new_arrival' => $data['new'] ?? false,
                    'is_sale' => $data['sale'] ?? false,
                    'badge' => $data['badge'] ?? null,
                    'seo_title' => $data['name'].' | Ash & Kash',
                    'seo_description' => 'Shop the '.$data['name'].' — premium women\'s fashion, cash on delivery available.',
                    'published_at' => now()->subDays(random_int(0, 60)),
                    'is_demo' => true,
                ]
            );

            // Tags
            $product->tags()->sync(collect($data['colors'])->isNotEmpty() ? $tags->random(min(2, $tags->count()))->pluck('id') : []);

            // Images (2-3 placeholders per product for card + hover + gallery)
            if ($product->getMedia('images')->isEmpty()) {
                foreach (range(0, 1) as $imgIndex) {
                    $tmp = PlaceholderImage::make($data['name'], $i + $imgIndex);
                    $product->addMedia($tmp)->preservingOriginal()->toMediaCollection('images');
                }
            }

            // Options: Size + Color -> generates real variants with independent inventory.
            if ($product->options()->count() === 0) {
                $sizeOption = $product->options()->create(['name' => 'Size', 'position' => 0]);
                $sizeValues = collect(['XS', 'S', 'M', 'L', 'XL'])->map(
                    fn ($size, $pos) => $sizeOption->values()->create(['value' => $size, 'position' => $pos])
                );

                $colorOption = $product->options()->create(['name' => 'Color', 'position' => 1]);
                $colorValues = collect($data['colors'])->map(
                    fn ($color, $pos) => $colorOption->values()->create([
                        'value' => $color,
                        'hex_value' => $this->colorSwatches[$color] ?? '#c69847',
                        'position' => $pos,
                    ])
                );

                $position = 0;
                foreach ($colorValues as $colorValue) {
                    foreach ($sizeValues as $sizeValue) {
                        $qty = random_int(0, 12);

                        $variant = $product->variants()->create([
                            'sku' => $sku.'-'.strtoupper(substr($colorValue->value, 0, 2)).'-'.$sizeValue->value,
                            'title' => "{$colorValue->value} / {$sizeValue->value}",
                            'inventory_quantity' => $qty,
                            'position' => $position++,
                            'is_active' => true,
                        ]);

                        $variant->optionValues()->attach([$colorValue->id, $sizeValue->id]);
                    }
                }

                $product->update(['inventory_quantity' => $product->variants()->sum('inventory_quantity')]);
            }
        }
    }
}
