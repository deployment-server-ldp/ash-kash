<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Product;
use App\Support\PlaceholderImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CollectionSeeder extends Seeder
{
    public function run(): void
    {
        $collections = [
            ['name' => 'Wedding Season Edit', 'rule' => 'sale'],
            ['name' => 'Everyday Essentials', 'rule' => 'best_seller'],
            ['name' => 'Statement Evening Wear', 'rule' => 'featured'],
        ];

        foreach ($collections as $i => $data) {
            $tmp = PlaceholderImage::make($data['name'], $i + 3, 1200, 700);
            $filename = 'collections/'.Str::slug($data['name']).'.jpg';
            Storage::disk('public')->put($filename, file_get_contents($tmp));
            @unlink($tmp);

            $collection = Collection::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'description' => 'A curated edit of our finest pieces.',
                    'image' => $filename,
                    'type' => 'manual',
                    'seo_title' => $data['name'].' | Ash & Kash',
                    'sort_order' => $i,
                    'is_active' => true,
                ]
            );

            $productIds = match ($data['rule']) {
                'sale' => Product::where('is_sale', true)->pluck('id'),
                'best_seller' => Product::where('is_best_seller', true)->pluck('id'),
                default => Product::where('is_featured', true)->pluck('id'),
            };

            $collection->products()->sync($productIds->mapWithKeys(fn ($id, $pos) => [$id => ['sort_order' => $pos]]));
        }
    }
}
