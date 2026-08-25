@php $collections = \App\Models\Collection::active()->orderBy('sort_order')->limit(4)->get(); @endphp

@if ($collections->isNotEmpty())
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="text-center max-w-xl mx-auto mb-12">
        @if ($section->title)
            <h2 class="font-serif text-3xl sm:text-4xl text-ink">{{ $section->title }}</h2>
        @endif
        @if ($section->subtitle)
            <p class="text-ink/60 mt-3">{{ $section->subtitle }}</p>
        @endif
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        @foreach ($collections as $collection)
            <a href="{{ route('shop.collection', $collection->slug) }}" class="group relative block aspect-[16/9] overflow-hidden bg-sand">
                @if ($collection->image)
                    <img src="{{ asset('storage/'.$collection->image) }}" alt="{{ $collection->name }}" class="w-full h-full object-cover transition duration-700 group-hover:scale-105">
                @endif
                <div class="absolute inset-0 bg-ink/30 flex items-center justify-center">
                    <p class="text-cream font-serif text-2xl">{{ $collection->name }}</p>
                </div>
            </a>
        @endforeach
    </div>
</section>
@endif
