<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class ProductController extends Controller
{
    public function show(Request $request, Product $product)
    {
        abort_unless($product->status === 'active', 404);

        $product->load([
            'category', 'brand', 'sizeGuide.rows', 'tags',
            'options.values', 'variants.optionValues.option',
            'approvedReviews' => fn ($q) => $q->latest(),
        ]);

        $related = Product::active()
            ->where('id', '!=', $product->id)
            ->when($product->category_id, fn ($q) => $q->where('category_id', $product->category_id))
            ->inRandomOrder()
            ->limit(4)
            ->get();

        $recentlyViewedIds = collect(json_decode($request->cookie('recently_viewed', '[]'), true))
            ->reject(fn ($id) => $id == $product->id)
            ->take(7)
            ->prepend($product->id)
            ->unique()
            ->values();

        $recentlyViewed = Product::active()
            ->whereIn('id', $recentlyViewedIds->slice(1))
            ->get();

        $cookie = Cookie::make('recently_viewed', json_encode($recentlyViewedIds), 60 * 24 * 30);

        return response()
            ->view('shop.product', compact('product', 'related', 'recentlyViewed'))
            ->withCookie($cookie);
    }
}
