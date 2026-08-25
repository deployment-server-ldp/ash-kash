<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $products = $this->applyFilters(Product::query()->active(), $request)->paginate(12)->withQueryString();
        $categories = Category::active()->root()->orderBy('sort_order')->get();

        return view('shop.index', [
            'products' => $products,
            'categories' => $categories,
            'title' => 'Shop All',
            'category' => null,
            'collection' => null,
        ]);
    }

    public function category(Request $request, Category $category)
    {
        abort_unless($category->is_active, 404);

        $categoryIds = $category->children()->pluck('id')->push($category->id);

        $products = $this->applyFilters(
            Product::query()->active()->whereIn('category_id', $categoryIds),
            $request
        )->paginate(12)->withQueryString();

        return view('shop.index', [
            'products' => $products,
            'categories' => Category::active()->root()->orderBy('sort_order')->get(),
            'title' => $category->name,
            'category' => $category,
            'collection' => null,
        ]);
    }

    public function collection(Request $request, Collection $collection)
    {
        abort_unless($collection->is_active, 404);

        $productIds = $collection->type === 'manual'
            ? $collection->products()->pluck('products.id')
            : $this->resolveAutomaticCollection($collection);

        $products = $this->applyFilters(
            Product::query()->active()->whereIn('id', $productIds),
            $request
        )->paginate(12)->withQueryString();

        return view('shop.index', [
            'products' => $products,
            'categories' => Category::active()->root()->orderBy('sort_order')->get(),
            'title' => $collection->name,
            'category' => null,
            'collection' => $collection,
        ]);
    }

    protected function resolveAutomaticCollection(Collection $collection)
    {
        $query = Product::query()->active();

        foreach ($collection->rules ?? [] as $field => $value) {
            if (in_array($field, ['is_featured', 'is_best_seller', 'is_new_arrival', 'is_sale'])) {
                $query->where($field, filter_var($value, FILTER_VALIDATE_BOOLEAN));
            } elseif ($field === 'category') {
                $query->whereHas('category', fn ($q) => $q->where('slug', $value));
            }
        }

        return $query->pluck('id');
    }

    protected function applyFilters($query, Request $request)
    {
        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('size')) {
            $query->whereHas('variants.optionValues', fn ($q) => $q->where('value', $request->size));
        }

        if ($request->filled('color')) {
            $query->whereHas('variants.optionValues', fn ($q) => $q->where('value', $request->color));
        }

        if ($request->boolean('in_stock')) {
            $query->where(function ($q) {
                $q->where('track_inventory', false)->orWhere('inventory_quantity', '>', 0);
            });
        }

        if ($request->boolean('on_sale')) {
            $query->onSale();
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $request->tag));
        }

        return match ($request->get('sort', 'featured')) {
            'newest' => $query->orderByDesc('published_at')->orderByDesc('id'),
            'price_low' => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            'best_selling' => $query->orderByDesc('is_best_seller')->orderByDesc('reviews_count'),
            'popular' => $query->orderByDesc('reviews_count'),
            default => $query->orderByDesc('is_featured')->orderByDesc('created_at'),
        };
    }
}
