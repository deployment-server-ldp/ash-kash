@extends('layouts.app')

@section('title', 'Order '.$order->order_number)

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
    <aside>@include('partials.account-nav')</aside>
    <div class="lg:col-span-3">
        <div class="flex items-center justify-between mb-8">
            <h1 class="font-serif text-3xl">Order {{ $order->order_number }}</h1>
            <span class="text-xs uppercase tracking-widest2 border border-gold-200 px-3 py-1.5">{{ str_replace('_', ' ', $order->status) }}</span>
        </div>

        {{-- Order tracking timeline --}}
        <div class="mb-10">
            <h2 class="font-serif text-lg mb-4">Order Tracking</h2>
            <ol class="space-y-4">
                @foreach ($order->statusHistories as $history)
                    <li class="flex gap-4">
                        <div class="w-2 h-2 rounded-full bg-gold-500 mt-1.5"></div>
                        <div>
                            <p class="text-sm font-medium">{{ ucwords(str_replace('_', ' ', $history->status)) }}</p>
                            <p class="text-xs text-ink/50">{{ $history->created_at->format('M j, Y g:ia') }} @if($history->note) — {{ $history->note }} @endif</p>
                        </div>
                    </li>
                @endforeach
            </ol>
            @if ($order->tracking_number)
                <p class="text-sm mt-4">Tracking number: <span class="font-medium">{{ $order->tracking_number }}</span></p>
            @endif
        </div>

        <h2 class="font-serif text-lg mb-4">Items</h2>
        <div class="divide-y divide-gold-100 mb-10">
            @foreach ($order->items as $item)
                <div class="flex gap-4 py-4">
                    <img src="{{ $item->image ? asset('storage/'.$item->image) : '/images/placeholder-product.svg' }}" class="w-16 h-20 object-cover bg-sand">
                    <div class="flex-1">
                        <p class="text-sm">{{ $item->product_name }}</p>
                        @if ($item->variant_title)<p class="text-xs text-ink/50">{{ $item->variant_title }}</p>@endif
                        <p class="text-xs text-ink/50">Qty {{ $item->quantity }}</p>
                    </div>
                    <span class="text-sm">{{ $order->currency_code }} {{ number_format($item->total_price, 2) }}</span>
                </div>
            @endforeach
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
                <h3 class="text-xs uppercase tracking-widest2 text-ink/50 mb-2">Shipping Address</h3>
                <p class="text-sm text-ink/70">
                    {{ $order->shipping_address['name'] ?? $order->customer_name }}<br>
                    {{ $order->shipping_address['address_line1'] ?? '' }}<br>
                    {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['country_code'] ?? '' }}<br>
                    {{ $order->phone }}
                </p>
            </div>
            <div>
                <h3 class="text-xs uppercase tracking-widest2 text-ink/50 mb-2">Order Total</h3>
                <div class="text-sm space-y-1 text-ink/70">
                    <div class="flex justify-between"><span>Subtotal</span><span>{{ number_format($order->subtotal, 2) }}</span></div>
                    <div class="flex justify-between"><span>Discount</span><span>-{{ number_format($order->discount_total, 2) }}</span></div>
                    <div class="flex justify-between"><span>Shipping</span><span>{{ number_format($order->shipping_total, 2) }}</span></div>
                    <div class="flex justify-between font-medium text-ink"><span>Total</span><span>{{ $order->currency_code }} {{ number_format($order->grand_total, 2) }}</span></div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
