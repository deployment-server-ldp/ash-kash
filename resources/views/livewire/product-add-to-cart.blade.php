<div class="space-y-6">
    @if ($product->has_variants)
        @foreach ($product->options as $option)
            <div>
                <p class="text-xs uppercase tracking-widest2 text-ink/60 mb-2">{{ $option->name }}</p>
                <div class="flex flex-wrap gap-2">
                    @foreach ($option->values as $value)
                        <button
                            type="button"
                            wire:click="selectOption('{{ $option->name }}', '{{ $value->value }}')"
                            @class([
                                'min-w-[2.75rem] h-11 px-3 border text-sm transition flex items-center justify-center',
                                'border-ink bg-ink text-cream' => ($selectedOptions[$option->name] ?? null) === $value->value,
                                'border-gold-200 text-ink hover:border-ink' => ($selectedOptions[$option->name] ?? null) !== $value->value,
                            ])
                        >
                            @if ($value->hex_value)
                                <span class="w-5 h-5 rounded-full border border-black/10 inline-block" style="background-color: {{ $value->hex_value }}"></span>
                            @else
                                {{ $value->value }}
                            @endif
                        </button>
                    @endforeach
                </div>
            </div>
        @endforeach
    @endif

    <div class="flex items-center gap-4">
        <div class="flex items-center border border-gold-200">
            <button type="button" wire:click="$set('quantity', {{ max(1, $quantity - 1) }})" class="w-10 h-11 text-ink/70 hover:bg-sand">-</button>
            <span class="w-10 text-center">{{ $quantity }}</span>
            <button type="button" wire:click="$set('quantity', {{ $quantity + 1 }})" class="w-10 h-11 text-ink/70 hover:bg-sand">+</button>
        </div>

        @php $stock = $this->selectedVariant?->inventory_quantity ?? $product->inventory_quantity; @endphp
        @if ($product->track_inventory && $product->has_variants && $this->selectedVariant && $stock <= 5 && $stock > 0)
            <span class="text-xs text-amber-700">Only {{ $stock }} left</span>
        @endif
    </div>

    @if ($error)
        <p class="text-sm text-red-600">{{ $error }}</p>
    @endif

    <button
        type="button"
        wire:click="addToCart"
        wire:loading.attr="disabled"
        @disabled(!$product->is_in_stock)
        class="w-full bg-ink text-cream py-4 uppercase tracking-widest2 text-xs hover:bg-gold-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
        <span wire:loading.remove>{{ $product->is_in_stock ? 'Add to Bag' : 'Out of Stock' }}</span>
        <span wire:loading>Adding…</span>
    </button>
</div>
