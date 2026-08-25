@props(['product'])

<div class="group relative">
    <a href="{{ route('shop.product', $product->slug) }}" class="block relative overflow-hidden bg-sand aspect-[4/5]">
        <img src="{{ $product->primary_image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover transition duration-500 group-hover:opacity-0">
        @if ($product->hover_image_url)
            <img src="{{ $product->hover_image_url }}" alt="{{ $product->name }}" class="absolute inset-0 w-full h-full object-cover opacity-0 transition duration-500 group-hover:opacity-100">
        @endif

        <div class="absolute top-3 left-3 flex flex-col gap-1.5">
            @if ($product->is_new_arrival)
                <span class="bg-ink text-cream text-[10px] uppercase tracking-widest2 px-2.5 py-1">New</span>
            @endif
            @if ($product->discount_percent)
                <span class="bg-red-600 text-white text-[10px] uppercase tracking-widest2 px-2.5 py-1">-{{ $product->discount_percent }}%</span>
            @endif
            @if ($product->badge)
                <span class="bg-gold-500 text-ink text-[10px] uppercase tracking-widest2 px-2.5 py-1">{{ $product->badge }}</span>
            @endif
        </div>

        <div class="absolute top-3 right-3">
            @livewire('wishlist-button', ['product' => $product], key('wishlist-'.$product->id))
        </div>

        @if (!$product->is_in_stock)
            <div class="absolute inset-0 bg-cream/70 flex items-center justify-center">
                <span class="text-xs uppercase tracking-widest2 text-ink">Out of Stock</span>
            </div>
        @endif
    </a>

    <div class="mt-4">
        <a href="{{ route('shop.product', $product->slug) }}" class="block text-sm text-ink hover:text-gold-600">{{ $product->name }}</a>
        <div class="flex items-center gap-2 mt-1">
            <span class="text-sm font-medium text-ink">{{ money($product->price) }}</span>
            @if ($product->compare_at_price && $product->compare_at_price > $product->price)
                <span class="text-sm text-ink/40 line-through">{{ money($product->compare_at_price) }}</span>
            @endif
        </div>
    </div>
</div>
