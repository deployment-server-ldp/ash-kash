@extends('layouts.app')

@section('title', $title)

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" x-data="{ filtersOpen: false }">

    @if ($collection?->image || $category?->banner)
        <div class="relative h-56 sm:h-72 mb-10 overflow-hidden bg-sand">
            <img src="{{ asset('storage/'.($category->banner ?? $collection->image)) }}" class="w-full h-full object-cover" alt="{{ $title }}">
            <div class="absolute inset-0 bg-ink/30 flex items-center justify-center">
                <h1 class="font-serif text-4xl text-cream">{{ $title }}</h1>
            </div>
        </div>
    @else
        <h1 class="font-serif text-4xl text-ink mb-2">{{ $title }}</h1>
        @if ($category?->description)
            <p class="text-ink/60 max-w-2xl mb-6">{{ $category->description }}</p>
        @endif
    @endif

    <div class="flex items-center justify-between mb-8 border-b border-gold-100 pb-4">
        <button @click="filtersOpen = true" class="lg:hidden flex items-center gap-2 text-sm uppercase tracking-widest2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4.5h18M6 9h12M9 13.5h6" /></svg>
            Filters
        </button>
        <p class="text-sm text-ink/50">{{ $products->total() }} products</p>
        <form method="GET" class="flex items-center gap-2">
            @foreach (request()->except('sort', 'page') as $key => $value)
                <input type="hidden" name="{{ $key }}" value="{{ $value }}">
            @endforeach
            <label class="text-xs uppercase tracking-widest2 text-ink/50">Sort by</label>
            <select name="sort" onchange="this.form.submit()" class="border-gold-200 text-sm focus:border-ink focus:ring-0">
                <option value="featured" @selected(request('sort', 'featured') === 'featured')>Featured</option>
                <option value="newest" @selected(request('sort') === 'newest')>Newest</option>
                <option value="price_low" @selected(request('sort') === 'price_low')>Price: Low to High</option>
                <option value="price_high" @selected(request('sort') === 'price_high')>Price: High to Low</option>
                <option value="best_selling" @selected(request('sort') === 'best_selling')>Best Selling</option>
                <option value="popular" @selected(request('sort') === 'popular')>Most Popular</option>
            </select>
        </form>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {{-- Desktop filters --}}
        <aside class="hidden lg:block">
            @include('shop.partials.filters')
        </aside>

        {{-- Mobile filter drawer --}}
        <div x-show="filtersOpen" x-cloak class="fixed inset-0 z-50 lg:hidden" style="display:none;">
            <div @click="filtersOpen = false" class="absolute inset-0 bg-ink/40"></div>
            <div class="absolute left-0 top-0 h-full w-80 bg-cream overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-6">
                    <span class="font-serif text-xl">Filters</span>
                    <button @click="filtersOpen = false"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                @include('shop.partials.filters')
            </div>
        </div>

        <div class="lg:col-span-3">
            @if ($products->isEmpty())
                <div class="text-center py-24">
                    <p class="text-ink/50 mb-4">No products match your filters.</p>
                    <a href="{{ route('shop.index') }}" class="text-gold-600 underline text-sm">Clear filters</a>
                </div>
            @else
                <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                    @foreach ($products as $product)
                        <x-product-card :product="$product" />
                    @endforeach
                </div>
                <div class="mt-12">{{ $products->links() }}</div>
            @endif
        </div>
    </div>
</div>
@endsection
