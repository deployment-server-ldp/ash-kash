@php $recent = \App\Models\Product::active()->latest()->limit(6)->get(); @endphp

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="text-center mb-10">
        <h2 class="font-serif text-3xl text-ink">{{ $section->title ?: '@'.setting('social_instagram', 'ashkash') }}</h2>
        @if ($section->subtitle)
            <p class="text-ink/60 mt-2">{{ $section->subtitle }}</p>
        @endif
    </div>
    <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
        @foreach ($recent as $product)
            <a href="{{ route('shop.product', $product->slug) }}" class="block aspect-square overflow-hidden bg-sand">
                <img src="{{ $product->primary_image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
            </a>
        @endforeach
    </div>
</section>
