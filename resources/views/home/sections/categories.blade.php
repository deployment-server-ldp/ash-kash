@php $categories = \App\Models\Category::active()->root()->orderBy('sort_order')->limit(3)->get(); @endphp

@if ($categories->isNotEmpty())
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="text-center max-w-xl mx-auto mb-12">
        @if ($section->title)
            <h2 class="font-serif text-3xl sm:text-4xl text-ink">{{ $section->title }}</h2>
        @endif
        @if ($section->subtitle)
            <p class="text-ink/60 mt-3">{{ $section->subtitle }}</p>
        @endif
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @foreach ($categories as $cat)
            <a href="{{ route('shop.category', $cat->slug) }}" class="group relative block aspect-[3/4] overflow-hidden bg-sand">
                @if ($cat->image)
                    <img src="{{ asset('storage/'.$cat->image) }}" alt="{{ $cat->name }}" class="w-full h-full object-cover transition duration-700 group-hover:scale-105">
                @endif
                <div class="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"></div>
                <div class="absolute bottom-6 left-6">
                    <p class="text-cream font-serif text-2xl">{{ $cat->name }}</p>
                    <span class="text-cream/80 text-xs uppercase tracking-widest2 mt-1 inline-block border-b border-cream/60">Shop Now</span>
                </div>
            </a>
        @endforeach
    </div>
</section>
@endif
