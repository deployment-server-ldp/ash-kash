@php $products = \App\Http\Controllers\HomeController::resolveFeaturedProducts($section); @endphp

@if ($products->isNotEmpty())
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="text-center max-w-xl mx-auto mb-12">
        @if ($section->title)
            <h2 class="font-serif text-3xl sm:text-4xl text-ink">{{ $section->title }}</h2>
        @endif
        @if ($section->subtitle)
            <p class="text-ink/60 mt-3">{{ $section->subtitle }}</p>
        @endif
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        @foreach ($products as $product)
            <x-product-card :product="$product" />
        @endforeach
    </div>

    <div class="text-center mt-12">
        <a href="{{ route('shop.index') }}" class="inline-block border border-ink px-8 py-3 uppercase tracking-widest2 text-xs hover:bg-ink hover:text-cream transition">
            {{ $section->button_text ?: 'View All' }}
        </a>
    </div>
</section>
@endif
