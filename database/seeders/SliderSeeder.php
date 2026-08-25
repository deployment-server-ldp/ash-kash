<?php

namespace Database\Seeders;

use App\Models\Slider;
use App\Support\PlaceholderImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SliderSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            ['tag' => 'NEW SEASON', 'title' => 'Discover the Latest Collection', 'subtitle' => 'Editorial silhouettes for effortless elegance', 'button_text' => 'Shop Now', 'button_url' => '/shop'],
            ['tag' => 'LUXURY EDIT', 'title' => 'Statement Pieces, Timeless Craft', 'subtitle' => 'Explore the Luxury Collection', 'button_text' => 'Explore', 'button_url' => '/category/luxury-collection'],
            ['tag' => 'SALE', 'title' => 'Up to 30% Off Select Styles', 'subtitle' => 'For a limited time only', 'button_text' => 'Shop Sale', 'button_url' => '/shop?on_sale=1'],
        ];

        foreach ($slides as $i => $data) {
            $tmp = PlaceholderImage::make($data['title'], $i + 6, 1920, 1080);
            $filename = 'sliders/'.Str::slug($data['title']).'.jpg';
            Storage::disk('public')->put($filename, file_get_contents($tmp));
            @unlink($tmp);

            $tmpMobile = PlaceholderImage::make($data['title'], $i + 6, 900, 1200);
            $filenameMobile = 'sliders/'.Str::slug($data['title']).'-mobile.jpg';
            Storage::disk('public')->put($filenameMobile, file_get_contents($tmpMobile));
            @unlink($tmpMobile);

            Slider::updateOrCreate(
                ['title' => $data['title']],
                $data + [
                    'desktop_image' => $filename,
                    'mobile_image' => $filenameMobile,
                    'text_align' => 'left',
                    'overlay_opacity' => 25,
                    'duration_ms' => 6000,
                    'sort_order' => $i,
                    'is_active' => true,
                ]
            );
        }
    }
}
