@extends('layouts.app')

@section('title', $product->seo_title ?: $product->name)
@section('description', $product->seo_description ?: Str::limit(strip_tags($product->short_description ?? $product->description), 155))
@section('canonical', route('shop.product', $product->slug))

@push('structured_data')
    <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": {!! json_encode($product->name) !!},
        "image": {!! json_encode($product->primary_image_url) !!},
        "description": {!! json_encode(strip_tags($product->short_description ?? '')) !!},
        "sku": {!! json_encode($product->sku) !!},
        "offers": {
            "@type": "Offer",
            "priceCurrency": {!! json_encode(currency()->baseCurrencyCode()) !!},
            "price": {!! json_encode((float) $product->price) !!},
            "availability": {!! json_encode($product->is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock") !!}
        }
        @if ($product->reviews_count > 0)
        ,"aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": {!! json_encode((float) $product->rating_avg) !!},
            "reviewCount": {!! json_encode($product->reviews_count) !!}
        }
        @endif
    }
    </script>
@endpush

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    {{-- Breadcrumbs --}}
    <nav class="text-xs text-ink/50 mb-8 flex gap-2">
        <a href="{{ route('home') }}" class="hover:text-ink">Home</a> /
        @if ($product->category)
            <a href="{{ route('shop.category', $product->category->slug) }}" class="hover:text-ink">{{ $product->category->name }}</a> /
        @endif
        <span class="text-ink">{{ $product->name }}</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {{-- Gallery --}}
        <div x-data="{ active: 0 }">
            <div class="aspect-[4/5] bg-sand overflow-hidden">
                @foreach ($product->getMedia('images') as $i => $media)
                    <img x-show="active === {{ $i }}" src="{{ $media->getUrl('card') }}" alt="{{ $product->name }}" class="w-full h-full object-cover" style="{{ $i === 0 ? '' : 'display:none' }}">
                @endforeach
                @if ($product->getMedia('images')->isEmpty())
                    <img src="{{ $product->primary_image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover">
                @endif
            </div>
            @if ($product->getMedia('images')->count() > 1)
                <div class="grid grid-cols-5 gap-2 mt-3">
                    @foreach ($product->getMedia('images') as $i => $media)
                        <button @click="active = {{ $i }}" class="aspect-[4/5] bg-sand overflow-hidden border" :class="active === {{ $i }} ? 'border-ink' : 'border-transparent'">
                            <img src="{{ $media->getUrl('thumb') }}" class="w-full h-full object-cover" alt="{{ $product->name }} thumbnail">
                        </button>
                    @endforeach
                </div>
            @endif
            @if ($product->video_url)
                <div class="mt-4 aspect-video">
                    <iframe src="{{ $product->video_url }}" class="w-full h-full" allowfullscreen title="{{ $product->name }} video"></iframe>
                </div>
            @endif
        </div>

        {{-- Details --}}
        <div>
            @if ($product->category)
                <p class="text-xs uppercase tracking-widest2 text-gold-600 mb-2">{{ $product->category->name }}</p>
            @endif
            <h1 class="font-serif text-3xl sm:text-4xl text-ink mb-3">{{ $product->name }}</h1>

            <div class="flex items-center gap-3 mb-4">
                @if ($product->reviews_count > 0)
                    <div class="flex text-gold-500 text-sm">
                        @for ($i = 1; $i <= 5; $i++){{ $i <= round($product->rating_avg) ? '★' : '☆' }}@endfor
                    </div>
                    <a href="#reviews" class="text-xs text-ink/50 underline">{{ $product->reviews_count }} reviews</a>
                @endif
            </div>

            <div class="flex items-center gap-3 mb-6">
                <span class="text-2xl text-ink">{{ money($product->price) }}</span>
                @if ($product->compare_at_price && $product->compare_at_price > $product->price)
                    <span class="text-lg text-ink/40 line-through">{{ money($product->compare_at_price) }}</span>
                    <span class="text-sm text-red-600">-{{ $product->discount_percent }}%</span>
                @endif
            </div>

            @if ($product->short_description)
                <div class="prose prose-sm max-w-none text-ink/70 mb-6">{!! $product->short_description !!}</div>
            @endif

            @if ($product->sizeGuide)
                <button onclick="document.getElementById('size-guide-modal').classList.remove('hidden')" class="text-xs uppercase tracking-widest2 text-gold-600 underline mb-6">Size Guide</button>
            @endif

            <livewire:product-add-to-cart :product="$product" />

            <div class="mt-6 text-sm text-ink/60">
                @if ($product->is_in_stock)
                    <p class="text-green-700">✓ In stock @if($product->is_low_stock) — hurry, low stock! @endif</p>
                @else
                    <p class="text-red-600">Currently out of stock</p>
                @endif
                <p class="mt-1">SKU: {{ $product->sku }}</p>
            </div>

            {{-- Accordions --}}
            <div class="mt-10 divide-y divide-gold-100 border-t border-b border-gold-100" x-data="{ tab: 'description' }">
                <div>
                    <button @click="tab = tab === 'description' ? '' : 'description'" class="w-full flex justify-between items-center py-4 text-sm uppercase tracking-widest2">
                        Description <span x-text="tab === 'description' ? '−' : '+'"></span>
                    </button>
                    <div x-show="tab === 'description'" class="pb-4 prose prose-sm max-w-none text-ink/70">{!! $product->description !!}</div>
                </div>
                <div>
                    <button @click="tab = tab === 'shipping' ? '' : 'shipping'" class="w-full flex justify-between items-center py-4 text-sm uppercase tracking-widest2">
                        Shipping & Returns <span x-text="tab === 'shipping' ? '−' : '+'"></span>
                    </button>
                    <div x-show="tab === 'shipping'" class="pb-4 text-sm text-ink/70">
                        <p>Cash on Delivery available. Standard delivery within {{ setting('free_shipping_note', '3-7 business days') }}.</p>
                        <p class="mt-2">Returns accepted within 7 days of delivery. See our <a href="{{ route('pages.show', 'return-policy') }}" class="underline">return policy</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Reviews --}}
    <section id="reviews" class="mt-20 max-w-3xl">
        <h2 class="font-serif text-2xl mb-8">Customer Reviews</h2>

        @forelse ($product->approvedReviews as $review)
            <div class="border-b border-gold-100 py-5">
                <div class="flex items-center gap-3 mb-1">
                    <div class="text-gold-500 text-sm">@for ($i = 1; $i <= 5; $i++){{ $i <= $review->rating ? '★' : '☆' }}@endfor</div>
                    <span class="text-sm font-medium">{{ $review->name }}</span>
                </div>
                @if ($review->title)
                    <p class="font-medium text-ink text-sm mt-2">{{ $review->title }}</p>
                @endif
                <p class="text-sm text-ink/70 mt-1">{{ $review->body }}</p>
            </div>
        @empty
            <p class="text-ink/50 text-sm mb-8">No reviews yet — be the first to review this product.</p>
        @endforelse

        <details class="mt-8">
            <summary class="cursor-pointer text-sm uppercase tracking-widest2 text-gold-600">Write a Review</summary>
            <form method="POST" action="{{ route('reviews.store', $product) }}" class="mt-6 space-y-4 max-w-md">
                @csrf
                <div>
                    <label class="text-xs uppercase tracking-widest2 text-ink/50">Rating</label>
                    <select name="rating" class="w-full border-gold-200 text-sm mt-1" required>
                        @for ($i = 5; $i >= 1; $i--)<option value="{{ $i }}">{{ $i }} Star{{ $i > 1 ? 's' : '' }}</option>@endfor
                    </select>
                </div>
                <input type="text" name="name" placeholder="Your name" required class="w-full border-gold-200 text-sm">
                <input type="email" name="email" placeholder="Your email" required class="w-full border-gold-200 text-sm">
                <input type="text" name="title" placeholder="Review title" class="w-full border-gold-200 text-sm">
                <textarea name="body" placeholder="Write your review..." required rows="4" class="w-full border-gold-200 text-sm"></textarea>
                <button class="bg-ink text-cream px-6 py-3 text-xs uppercase tracking-widest2">Submit Review</button>
            </form>
        </details>
    </section>

    {{-- Related --}}
    @if ($related->isNotEmpty())
        <section class="mt-20">
            <h2 class="font-serif text-2xl mb-8">You May Also Like</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                @foreach ($related as $item)
                    <x-product-card :product="$item" />
                @endforeach
            </div>
        </section>
    @endif

    {{-- Recently viewed --}}
    @if ($recentlyViewed->isNotEmpty())
        <section class="mt-20">
            <h2 class="font-serif text-2xl mb-8">Recently Viewed</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                @foreach ($recentlyViewed as $item)
                    <x-product-card :product="$item" />
                @endforeach
            </div>
        </section>
    @endif
</div>

@if ($product->sizeGuide)
    <div id="size-guide-modal" class="hidden fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-6">
        <div class="bg-white max-w-lg w-full p-8 relative">
            <button onclick="document.getElementById('size-guide-modal').classList.add('hidden')" class="absolute top-4 right-4 text-ink/50">&times;</button>
            <h3 class="font-serif text-xl mb-4">{{ $product->sizeGuide->title }}</h3>
            @if ($product->sizeGuide->instructions)
                <p class="text-sm text-ink/60 mb-4">{{ $product->sizeGuide->instructions }}</p>
            @endif
            <table class="w-full text-sm text-left">
                <thead>
                    <tr class="border-b border-gold-200">
                        <th class="py-2">Size</th>
                        @foreach (($product->sizeGuide->rows->first()->measurements ?? []) as $key => $val)
                            <th class="py-2">{{ $key }} ({{ $product->sizeGuide->unit }})</th>
                        @endforeach
                    </tr>
                </thead>
                <tbody>
                    @foreach ($product->sizeGuide->rows as $row)
                        <tr class="border-b border-gold-100">
                            <td class="py-2">{{ $row->size_name }}</td>
                            @foreach ($row->measurements as $val)
                                <td class="py-2">{{ $val }}</td>
                            @endforeach
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endif
@endsection
