<div
    x-data
    x-show="$wire.open"
    x-cloak
    class="fixed inset-0 z-50"
    style="display: none;"
>
    <div
        x-show="$wire.open"
        x-transition:enter="transition-opacity ease-out duration-300"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="transition-opacity ease-in duration-200"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        class="absolute inset-0 bg-ink/40"
        @click="$wire.close()"
    ></div>

    <div
        x-show="$wire.open"
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="translate-x-full"
        x-transition:enter-end="translate-x-0"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="translate-x-0"
        x-transition:leave-end="translate-x-full"
        class="absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col"
    >
        <div class="flex items-center justify-between px-6 py-5 border-b border-gold-200">
            <h2 class="font-serif text-2xl text-ink">Your Bag ({{ $items->sum('quantity') }})</h2>
            <button @click="$wire.close()" class="text-ink/60 hover:text-ink" aria-label="Close cart">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            @forelse ($items as $item)
                <div class="flex gap-4" wire:key="cart-item-{{ $item->id }}">
                    <img src="{{ $item->product->primary_image_url }}" alt="{{ $item->product->name }}" class="w-20 h-24 object-cover bg-sand">
                    <div class="flex-1">
                        <div class="flex justify-between">
                            <p class="font-medium text-ink text-sm">{{ $item->product->name }}</p>
                            <button wire:click="remove({{ $item->id }})" class="text-ink/40 hover:text-red-600 text-sm">&times;</button>
                        </div>
                        @if ($item->variant)
                            <p class="text-xs text-ink/50 mt-0.5">{{ $item->variant->display_title }}</p>
                        @endif
                        <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center border border-gold-200">
                                <button wire:click="decrement({{ $item->id }})" class="w-7 h-7 text-ink/70 hover:bg-sand">-</button>
                                <span class="w-8 text-center text-sm">{{ $item->quantity }}</span>
                                <button wire:click="increment({{ $item->id }})" class="w-7 h-7 text-ink/70 hover:bg-sand">+</button>
                            </div>
                            <span class="text-sm font-medium text-ink">{{ money($item->line_total) }}</span>
                        </div>
                    </div>
                </div>
            @empty
                <div class="text-center py-16">
                    <p class="text-ink/50">Your bag is empty.</p>
                    <a href="{{ route('shop.index') }}" @click="$wire.close()" class="inline-block mt-4 text-gold-600 underline text-sm">Continue shopping</a>
                </div>
            @endforelse
        </div>

        @if ($items->isNotEmpty())
            <div class="border-t border-gold-200 px-6 py-5 space-y-4">
                <div class="flex justify-between text-ink font-medium">
                    <span>Subtotal</span>
                    <span>{{ money($subtotal) }}</span>
                </div>
                <p class="text-xs text-ink/50">Shipping and discounts calculated at checkout.</p>
                <a href="{{ route('checkout.index') }}" class="block w-full text-center bg-ink text-cream py-3.5 uppercase tracking-widest2 text-xs hover:bg-gold-700 transition">
                    Checkout
                </a>
                <a href="{{ route('cart.index') }}" class="block w-full text-center border border-ink text-ink py-3 uppercase tracking-widest2 text-xs hover:bg-sand transition">
                    View Bag
                </a>
            </div>
        @endif
    </div>
</div>
