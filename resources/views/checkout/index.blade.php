@extends('layouts.app')

@section('title', 'Checkout')

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    x-data="checkoutForm({{ $shippingZones->toJson() }}, '{{ $countryCode }}', {{ $totals['subtotal'] }})">
    <h1 class="font-serif text-4xl mb-10">Checkout</h1>

    @if ($errors->any())
        <div class="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-6">
            <ul class="list-disc list-inside">
                @foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('checkout.store') }}" class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        @csrf
        <div class="lg:col-span-2 space-y-8">
            <div>
                <h2 class="font-serif text-xl mb-4">Contact Information</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" name="name" value="{{ old('name', $defaultAddress?->full_name) }}" placeholder="Full name" required class="border-gold-200 focus:border-ink focus:ring-0">
                    <input type="tel" name="phone" value="{{ old('phone', $defaultAddress?->phone) }}" placeholder="Phone number" required class="border-gold-200 focus:border-ink focus:ring-0">
                    <input type="email" name="email" value="{{ old('email') }}" placeholder="Email (optional)" class="border-gold-200 focus:border-ink focus:ring-0 sm:col-span-2">
                </div>
            </div>

            <div>
                <h2 class="font-serif text-xl mb-4">Shipping Address</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select name="country_code" x-model="countryCode" required class="border-gold-200 focus:border-ink focus:ring-0 sm:col-span-2">
                        @foreach ($countries as $c)
                            <option value="{{ $c->iso2 }}" @selected(old('country_code', $countryCode) === $c->iso2)>{{ $c->name }}</option>
                        @endforeach
                    </select>
                    <input type="text" name="state" value="{{ old('state', $defaultAddress?->state) }}" placeholder="State / Province" class="border-gold-200 focus:border-ink focus:ring-0">
                    <input type="text" name="city" value="{{ old('city', $defaultAddress?->city) }}" placeholder="City" required class="border-gold-200 focus:border-ink focus:ring-0">
                    <input type="text" name="address_line1" value="{{ old('address_line1', $defaultAddress?->address_line1) }}" placeholder="Street address" required class="border-gold-200 focus:border-ink focus:ring-0 sm:col-span-2">
                    <input type="text" name="address_line2" value="{{ old('address_line2', $defaultAddress?->address_line2) }}" placeholder="Apartment, suite, etc. (optional)" class="border-gold-200 focus:border-ink focus:ring-0 sm:col-span-2">
                    <input type="text" name="postal_code" value="{{ old('postal_code', $defaultAddress?->postal_code) }}" placeholder="Postal code" class="border-gold-200 focus:border-ink focus:ring-0">
                </div>
            </div>

            <div>
                <h2 class="font-serif text-xl mb-4">Order Notes</h2>
                <textarea name="notes" rows="3" placeholder="Notes about your order (optional)" class="w-full border-gold-200 focus:border-ink focus:ring-0">{{ old('notes') }}</textarea>
            </div>

            <div>
                <h2 class="font-serif text-xl mb-4">Payment</h2>
                <div class="border border-ink p-4 flex items-center gap-3 bg-sand/50">
                    <input type="radio" checked disabled>
                    <div>
                        <p class="font-medium text-sm">Cash on Delivery</p>
                        <p class="text-xs text-ink/50">Pay with cash when your order is delivered.</p>
                    </div>
                </div>
            </div>

            <button type="submit" class="w-full bg-ink text-cream py-4 uppercase tracking-widest2 text-xs hover:bg-gold-700 transition">
                Place Order — Cash on Delivery
            </button>
        </div>

        <div class="border border-gold-100 p-6 h-fit">
            <h2 class="font-serif text-xl mb-5">Order Summary</h2>
            <div class="space-y-4 max-h-64 overflow-y-auto mb-5">
                @foreach ($cart->items as $item)
                    <div class="flex gap-3">
                        <img src="{{ $item->product->primary_image_url }}" class="w-14 h-16 object-cover bg-sand">
                        <div class="flex-1 text-sm">
                            <p class="text-ink">{{ $item->product->name }} &times;{{ $item->quantity }}</p>
                            @if ($item->variant)<p class="text-xs text-ink/50">{{ $item->variant->display_title }}</p>@endif
                        </div>
                        <span class="text-sm">{{ money($item->line_total) }}</span>
                    </div>
                @endforeach
            </div>
            <div class="space-y-3 text-sm border-t border-gold-100 pt-4">
                <div class="flex justify-between"><span>Subtotal</span><span>{{ money($totals['subtotal']) }}</span></div>
                @if ($totals['discount'] > 0)
                    <div class="flex justify-between text-green-700"><span>Discount</span><span>-{{ money($totals['discount']) }}</span></div>
                @endif
                <div class="flex justify-between"><span>Shipping</span><span x-text="shippingLabel"></span></div>
                <div class="flex justify-between font-medium text-base border-t border-gold-100 pt-3"><span>Total</span><span>{{ money($totals['grand_total']) }}</span></div>
            </div>
        </div>
    </form>
</div>

@push('scripts')
<script>
    function checkoutForm(zones, initialCountry, subtotal) {
        return {
            zones,
            countryCode: initialCountry,
            get shippingLabel() {
                const zone = this.zones.find(z => (z.countries || []).includes(this.countryCode))
                    || this.zones.find(z => (z.countries || []).includes('*'));
                const method = zone?.active_methods?.[0];
                if (!method) return 'Calculated at next step';
                if (method.free_shipping_threshold && subtotal >= method.free_shipping_threshold) return 'Free';
                return method.price > 0 ? Number(method.price).toLocaleString() : 'Free';
            }
        }
    }
</script>
@endpush
@endsection
