<section class="relative overflow-hidden">
    @if ($section->image)
        <img src="{{ asset('storage/'.$section->image) }}" alt="{{ $section->title }}" class="w-full h-[40vh] object-cover">
    @endif
    <div class="absolute inset-0 bg-ink/40 flex items-center justify-center text-center">
        <div class="px-6">
            @if ($section->title)
                <h2 class="font-serif text-3xl sm:text-4xl text-cream mb-3">{{ $section->title }}</h2>
            @endif
            @if ($section->subtitle)
                <p class="text-cream/90 mb-6">{{ $section->subtitle }}</p>
            @endif
            @if ($section->button_text)
                <a href="{{ $section->button_url ?? route('shop.index') }}" class="inline-block bg-cream text-ink px-8 py-3 uppercase tracking-widest2 text-xs">{{ $section->button_text }}</a>
            @endif
        </div>
    </div>
</section>
