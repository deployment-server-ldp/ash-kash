@extends('layouts.app')

@section('title', 'My Account')

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
    <aside>@include('partials.account-nav')</aside>
    <div class="lg:col-span-3">
        <h1 class="font-serif text-3xl mb-2">Welcome back, {{ $customer->name }}</h1>
        <p class="text-ink/60 mb-8">{{ $customer->email }}</p>

        <h2 class="font-serif text-xl mb-4">Recent Orders</h2>
        @forelse ($recentOrders as $order)
            <a href="{{ route('account.orders.show', $order->order_number) }}" class="flex justify-between items-center border-b border-gold-100 py-4">
                <div>
                    <p class="text-sm font-medium">{{ $order->order_number }}</p>
                    <p class="text-xs text-ink/50">{{ $order->created_at->format('M j, Y') }}</p>
                </div>
                <span class="text-xs uppercase tracking-widest2 border border-gold-200 px-2 py-1">{{ str_replace('_', ' ', $order->status) }}</span>
                <span class="text-sm">{{ $order->currency_code }} {{ number_format($order->grand_total, 2) }}</span>
            </a>
        @empty
            <p class="text-ink/50 text-sm">You haven't placed any orders yet.</p>
        @endforelse
    </div>
</div>
@endsection
