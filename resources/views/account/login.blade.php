@extends('layouts.app')

@section('title', 'Sign In')

@section('content')
<div class="max-w-md mx-auto px-4 py-20">
    <h1 class="font-serif text-3xl mb-8 text-center">Sign In</h1>

    @if ($errors->any())
        <div class="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-6">{{ $errors->first() }}</div>
    @endif

    <form method="POST" action="{{ route('account.login') }}" class="space-y-4">
        @csrf
        <input type="email" name="email" value="{{ old('email') }}" placeholder="Email address" required autofocus class="w-full border-gold-200 focus:border-ink focus:ring-0">
        <input type="password" name="password" placeholder="Password" required class="w-full border-gold-200 focus:border-ink focus:ring-0">
        <label class="flex items-center gap-2 text-sm text-ink/60">
            <input type="checkbox" name="remember"> Remember me
        </label>
        <button class="w-full bg-ink text-cream py-3.5 uppercase tracking-widest2 text-xs hover:bg-gold-700">Sign In</button>
    </form>

    <p class="text-center text-sm text-ink/60 mt-6">
        New here? <a href="{{ route('account.register') }}" class="text-gold-600 underline">Create an account</a>
    </p>
</div>
@endsection
