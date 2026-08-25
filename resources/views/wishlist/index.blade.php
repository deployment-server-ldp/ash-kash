@extends('layouts.app')

@section('title', 'Wishlist')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="font-serif text-4xl mb-10">My Wishlist</h1>

    @if ($wishlists->isEmpty())
        <div class="text-center py-24 border border-gold-100">
            <p class="text-ink/50 mb-6">Your wishlist is empty.</p>
            <a href="{{ route('shop.index') }}" class="inline-block bg-ink text-cream px-8 py-3 uppercase tracking-widest2 text-xs">Continue Shopping</a>
        </div>
    @else
        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            @foreach ($wishlists as $w)
                @if ($w->product)
                    <x-product-card :product="$w->product" />
                @endif
            @endforeach
        </div>
    @endif
</div>
@endsection
