@extends('layouts.app')

@section('title', 'Search results for "'.$term.'"')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="font-serif text-3xl mb-2">Search Results</h1>
    <p class="text-ink/60 mb-10">{{ $products->total() }} results for "{{ $term }}"</p>

    @if ($products->isEmpty())
        <div class="text-center py-24">
            <p class="text-ink/50 mb-4">We couldn't find anything matching "{{ $term }}".</p>
            <a href="{{ route('shop.index') }}" class="text-gold-600 underline text-sm">Browse all products</a>
        </div>
    @else
        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            @foreach ($products as $product)
                <x-product-card :product="$product" />
            @endforeach
        </div>
        <div class="mt-12">{{ $products->links() }}</div>
    @endif
</div>
@endsection
