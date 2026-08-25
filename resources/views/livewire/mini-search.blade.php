<div class="relative">
    <div class="flex items-center border-b border-ink/20 pb-2">
        <svg class="w-5 h-5 text-ink/50 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
        <input
            type="text"
            wire:model.live.debounce.300ms="query"
            placeholder="Search for dresses, tags, SKU…"
            class="w-full border-0 focus:ring-0 text-ink placeholder:text-ink/40 bg-transparent p-0 text-lg font-serif"
            autofocus
        >
        <a href="{{ route('search', ['q' => $query]) }}" class="text-xs uppercase tracking-widest2 text-gold-600 whitespace-nowrap ml-3">See all</a>
    </div>

    @if ($query && $query !== '')
        <div class="mt-4 divide-y divide-gold-100">
            @forelse ($results as $product)
                <a href="{{ route('shop.product', $product->slug) }}" class="flex items-center gap-4 py-3 group">
                    <img src="{{ $product->primary_image_url }}" class="w-12 h-14 object-cover bg-sand" alt="{{ $product->name }}">
                    <div>
                        <p class="text-sm text-ink group-hover:text-gold-600">{{ $product->name }}</p>
                        <p class="text-xs text-ink/50">{{ money($product->price) }}</p>
                    </div>
                </a>
            @empty
                <p class="text-sm text-ink/50 py-4">No products found for "{{ $query }}".</p>
            @endforelse
        </div>
    @else
        <div class="mt-4">
            <p class="text-xs uppercase tracking-widest2 text-ink/40 mb-2">Popular searches</p>
            <div class="flex flex-wrap gap-2">
                @foreach (['New Arrivals', 'Dresses', 'Luxury Collection', 'Sale'] as $term)
                    <a href="{{ route('search', ['q' => $term]) }}" class="text-xs border border-gold-200 px-3 py-1.5 text-ink/70 hover:border-ink">{{ $term }}</a>
                @endforeach
            </div>
        </div>
    @endif
</div>
