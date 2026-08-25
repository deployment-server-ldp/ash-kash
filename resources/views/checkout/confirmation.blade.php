@extends('layouts.app')

@section('title', 'Order Confirmed')

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <div class="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
    <h1 class="font-serif text-4xl mb-3">Thank you, {{ $order->customer_name }}!</h1>
    <p class="text-ink/60 mb-8">Your order has been placed and will be paid for via Cash on Delivery.</p>

    <div class="border border-gold-100 text-left p-8 mb-10">
        <div class="flex justify-between mb-6 pb-6 border-b border-gold-100">
            <div>
                <p class="text-xs uppercase tracking-widest2 text-ink/50">Order Number</p>
                <p class="font-medium">{{ $order->order_number }}</p>
            </div>
            <div>
                <p class="text-xs uppercase tracking-widest2 text-ink/50">Total</p>
                <p class="font-medium">{{ $order->currency_code }} {{ number_format($order->grand_total, 2) }}</p>
            </div>
            <div>
                <p class="text-xs uppercase tracking-widest2 text-ink/50">Payment</p>
                <p class="font-medium">Cash on Delivery</p>
            </div>
        </div>

        <div class="space-y-4">
            @foreach ($order->items as $item)
                <div class="flex justify-between text-sm">
                    <span>{{ $item->product_name }} @if($item->variant_title)({{ $item->variant_title }})@endif &times;{{ $item->quantity }}</span>
                    <span>{{ $order->currency_code }} {{ number_format($item->total_price, 2) }}</span>
                </div>
            @endforeach
        </div>
    </div>

    <a href="{{ route('shop.index') }}" class="inline-block bg-ink text-cream px-8 py-3.5 uppercase tracking-widest2 text-xs hover:bg-gold-700">Continue Shopping</a>
</div>
@endsection
