@extends('layouts.app')

@section('title', 'Page Not Found')

@section('content')
<div class="max-w-xl mx-auto px-4 py-32 text-center">
    <p class="font-serif text-7xl text-gold-500 mb-4">404</p>
    <h1 class="font-serif text-3xl mb-4">We couldn't find that page</h1>
    <p class="text-ink/60 mb-8">The page you're looking for may have been moved or no longer exists.</p>
    <a href="{{ route('home') }}" class="inline-block bg-ink text-cream px-8 py-3.5 uppercase tracking-widest2 text-xs hover:bg-gold-700">Back to Home</a>
</div>
@endsection
