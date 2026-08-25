<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    @if ($section->image)
        <img src="{{ asset('storage/'.$section->image) }}" alt="{{ $section->title }}" class="w-full aspect-[4/5] object-cover">
    @endif
    <div>
        @if ($section->title)
            <h2 class="font-serif text-3xl sm:text-4xl text-ink mb-4">{{ $section->title }}</h2>
        @endif
        @if ($section->subtitle)
            <p class="text-gold-600 uppercase tracking-widest2 text-xs mb-4">{{ $section->subtitle }}</p>
        @endif
        @if ($section->content)
            <p class="text-ink/70 leading-relaxed">{{ $section->content }}</p>
        @endif
        @if ($section->button_text)
            <a href="{{ $section->button_url ?? route('about') }}" class="inline-block mt-6 border-b border-ink text-sm uppercase tracking-widest2">{{ $section->button_text }}</a>
        @endif
    </div>
</section>
