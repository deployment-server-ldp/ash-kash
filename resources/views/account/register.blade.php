@extends('layouts.app')

@section('title', 'Create Account')

@section('content')
<div class="max-w-md mx-auto px-4 py-20">
    <h1 class="font-serif text-3xl mb-8 text-center">Create Account</h1>

    @if ($errors->any())
        <div class="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-6">
            <ul class="list-disc list-inside">
                @foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('account.register') }}" class="space-y-4">
        @csrf
        <input type="text" name="name" value="{{ old('name') }}" placeholder="Full name" required class="w-full border-gold-200 focus:border-ink focus:ring-0">
        <input type="email" name="email" value="{{ old('email') }}" placeholder="Email address" required class="w-full border-gold-200 focus:border-ink focus:ring-0">
        <input type="tel" name="phone" value="{{ old('phone') }}" placeholder="Phone number" class="w-full border-gold-200 focus:border-ink focus:ring-0">
        <input type="password" name="password" placeholder="Password" required class="w-full border-gold-200 focus:border-ink focus:ring-0">
        <input type="password" name="password_confirmation" placeholder="Confirm password" required class="w-full border-gold-200 focus:border-ink focus:ring-0">
        <button class="w-full bg-ink text-cream py-3.5 uppercase tracking-widest2 text-xs hover:bg-gold-700">Create Account</button>
    </form>

    <p class="text-center text-sm text-ink/60 mt-6">
        Already have an account? <a href="{{ route('account.login') }}" class="text-gold-600 underline">Sign in</a>
    </p>
</div>
@endsection
