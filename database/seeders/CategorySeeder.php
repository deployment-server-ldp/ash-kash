<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Support\PlaceholderImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'New Arrivals',
                'description' => 'The latest additions to our boutique — fresh silhouettes, updated every week.',
            ],
            [
                'name' => 'Ready to Wear',
                'description' => 'Everyday elegance — dresses, separates and essentials for effortless style.',
            ],
            [
                'name' => 'Luxury Collection',
                'description' => 'Our most refined pieces, crafted from premium fabrics for statement occasions.',
            ],
        ];

        foreach ($categories as $i => $data) {
            $imagePath = $this->storeImage($data['name'], $i);

            Category::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'image' => $imagePath,
                    'banner' => $imagePath,
                    'seo_title' => $data['name'].' | Ash & Kash',
                    'seo_description' => $data['description'],
                    'sort_order' => $i,
                    'is_active' => true,
                ]
            );
        }
    }

    protected function storeImage(string $label, int $seed): string
    {
        $tmp = PlaceholderImage::make($label, $seed, 900, 600);
        $filename = 'categories/'.Str::slug($label).'.jpg';
        Storage::disk('public')->put($filename, file_get_contents($tmp));
        @unlink($tmp);

        return $filename;
    }
}
