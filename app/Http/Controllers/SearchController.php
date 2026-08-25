<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $term = trim((string) $request->get('q'));

        $products = Product::query()->active()
            ->when($term, function ($query) use ($term) {
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%")
                        ->orWhereHas('tags', fn ($t) => $t->where('name', 'like', "%{$term}%"))
                        ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$term}%"));
                });
            })
            ->paginate(12)
            ->withQueryString();

        return view('search.index', compact('products', 'term'));
    }
}
