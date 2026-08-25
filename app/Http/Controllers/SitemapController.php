<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    public function index()
    {
        $xml = Cache::remember('sitemap.xml', now()->addHour(), function () {
            $sitemap = Sitemap::create()
                ->add(Url::create(route('home'))->setPriority(1.0))
                ->add(Url::create(route('shop.index'))->setPriority(0.9))
                ->add(Url::create(route('blog.index')))
                ->add(Url::create(route('about')))
                ->add(Url::create(route('contact')));

            Category::active()->each(fn ($c) => $sitemap->add(
                Url::create(route('shop.category', $c->slug))->setPriority(0.8)
            ));

            Collection::active()->each(fn ($c) => $sitemap->add(
                Url::create(route('shop.collection', $c->slug))->setPriority(0.8)
            ));

            Product::active()->each(fn ($p) => $sitemap->add(
                Url::create(route('shop.product', $p->slug))
                    ->setLastModificationDate($p->updated_at)
                    ->setPriority(0.7)
            ));

            Page::published()->each(fn ($p) => $sitemap->add(Url::create(route('pages.show', $p->slug))));

            BlogPost::published()->each(fn ($p) => $sitemap->add(
                Url::create(route('blog.show', $p->slug))->setLastModificationDate($p->updated_at)
            ));

            return $sitemap->render();
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function robots()
    {
        $content = "User-agent: *\nAllow: /\nDisallow: /account/\nDisallow: /checkout\nDisallow: /cart\nSitemap: ".route('sitemap');

        return response($content, 200)->header('Content-Type', 'text/plain');
    }
}
