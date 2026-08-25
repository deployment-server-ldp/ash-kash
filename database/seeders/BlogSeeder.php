<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use App\Support\PlaceholderImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $styleCat = BlogCategory::updateOrCreate(['slug' => 'style-guides'], ['name' => 'Style Guides']);
        $newsCat = BlogCategory::updateOrCreate(['slug' => 'news'], ['name' => 'News']);
        $author = User::first();

        $posts = [
            ['title' => 'Five Ways to Style This Season\'s Silk Dresses', 'category' => $styleCat, 'excerpt' => 'From daytime elegance to evening glamour, here\'s how to wear our silk collection.'],
            ['title' => 'The Ash & Kash Autumn Edit Has Arrived', 'category' => $newsCat, 'excerpt' => 'Discover the pieces defining the new season.'],
            ['title' => 'A Guide to Building a Timeless Capsule Wardrobe', 'category' => $styleCat, 'excerpt' => 'Fewer, better pieces — our edit of true wardrobe essentials.'],
        ];

        foreach ($posts as $i => $data) {
            $tmp = PlaceholderImage::make($data['title'], $i + 12, 1200, 800);
            $filename = 'blog/'.Str::slug($data['title']).'.jpg';
            Storage::disk('public')->put($filename, file_get_contents($tmp));
            @unlink($tmp);

            BlogPost::updateOrCreate(
                ['slug' => Str::slug($data['title'])],
                [
                    'blog_category_id' => $data['category']->id,
                    'author_id' => $author?->id,
                    'title' => $data['title'],
                    'excerpt' => $data['excerpt'],
                    'content' => '<p>'.$data['excerpt'].'</p><p>Our design team draws inspiration from timeless silhouettes, reimagined for the modern woman. Each collection balances craftsmanship with everyday wearability.</p>',
                    'featured_image' => $filename,
                    'tags' => ['fashion', 'style'],
                    'seo_title' => $data['title'],
                    'is_published' => true,
                    'published_at' => now()->subDays($i * 5),
                ]
            );
        }
    }
}
