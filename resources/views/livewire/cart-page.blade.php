<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="font-serif text-4xl mb-10">Your Shopping Bag</h1>

    @if ($items->isEmpty())
        <div class="text-center py-24 border border-gold-100">
            <p class="text-ink/50 mb-6">Your bag is currently empty.</p>
            <a href="{{ route('shop.index') }}" class="inline-block bg-ink text-cream px-8 py-3 uppercase tracking-widest2 text-xs hover:bg-gold-700">Continue Shopping</a>
        </div>
    @else
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div class="lg:col-span-2 divide-y divide-gold-100">
                @error('stock') <p class="text-sm text-red-600 mb-4">{{ $message }}</p> @enderror
                @foreach ($items as $item)
                    <div class="flex gap-5 py-6" wire:key="cart-page-item-{{ $item->id }}">
                        <img src="{{ $item->product->primary_image_url }}" class="w-28 h-36 object-cover bg-sand" alt="{{ $item->product->name }}">
                        <div class="flex-1">
                            <div class="flex justify-between">
                                <div>
                                    <a href="{{ route('shop.product', $item->product->slug) }}" class="font-medium text-ink hover:text-gold-600">{{ $item->product->name }}</a>
                                    @if ($item->variant)
                                        <p class="text-sm text-ink/50 mt-1">{{ $item->variant->display_title }}</p>
                                    @endif
                                </div>
                                <button wire:click="remove({{ $item->id }})" class="text-ink/40 hover:text-red-600">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div class="flex items-center justify-between mt-6">
                                <div class="flex items-center border border-gold-200">
                                    <button wire:click="decrement({{ $item->id }})" class="w-9 h-9 hover:bg-sand">-</button>
                                    <span class="w-10 text-center">{{ $item->quantity }}</span>
                                    <button wire:click="increment({{ $item->id }})" class="w-9 h-9 hover:bg-sand">+</button>
                                </div>
                                <span class="font-medium">{{ money($item->line_total) }}</span>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>

            <div class="border border-gold-100 p-6 h-fit">
                <h2 class="font-serif text-xl mb-5">Order Summary</h2>

                <form wire:submit="applyCoupon" class="flex gap-2 mb-5">
                    <input type="text" wire:model="couponCode" placeholder="Coupon code" class="flex-1 border-gold-200 text-sm focus:border-ink focus:ring-0">
                    <button class="border border-ink px-4 text-xs uppercase tracking-widest2 hover:bg-ink hover:text-cream">Apply</button>
                </form>
                @if ($couponError)
                    <p class="text-sm text-red-600 mb-4">{{ $couponError }}</p>
                @endif
                @if ($totals['coupon'])
                    <div class="flex justify-between text-sm text-green-700 mb-4">
                        <span>Coupon "{{ $totals['coupon']->code }}" applied</span>
                        <button wire:click="removeCoupon" class="underline">Remove</button>
                    </div>
                @endif

                <div class="space-y-3 text-sm border-t border-gold-100 pt-4">
                    <div class="flex justify-between"><span>Subtotal</span><span>{{ money($totals['subtotal']) }}</span></div>
                    @if ($totals['discount'] > 0)
                        <div class="flex justify-between text-green-700"><span>Discount</span><span>-{{ money($totals['discount']) }}</span></div>
                    @endif
                    <div class="flex justify-between"><span>Shipping</span><span>{{ $totals['shipping'] > 0 ? money($totals['shipping']) : 'Calculated at checkout' }}</span></div>
                    <div class="flex justify-between font-medium text-base border-t border-gold-100 pt-3"><span>Total</span><span>{{ money($totals['grand_total']) }}</span></div>
                </div>

                <a href="{{ route('checkout.index') }}" class="block w-full text-center bg-ink text-cream py-4 uppercase tracking-widest2 text-xs mt-6 hover:bg-gold-700">
                    Proceed to Checkout
                </a>
                <a href="{{ route('shop.index') }}" class="block w-full text-center text-ink/60 text-xs mt-4 underline">Continue shopping</a>
            </div>
        </div>
    @endif
</div>
