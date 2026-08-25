@extends('layouts.app')

@section('title', 'My Profile')

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
    <aside>@include('partials.account-nav')</aside>
    <div class="lg:col-span-3 max-w-md">
        <h1 class="font-serif text-3xl mb-8">My Profile</h1>

        @if ($errors->any())
            <div class="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-6">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('account.profile.update') }}" class="space-y-4">
            @csrf @method('PUT')
            <input type="text" name="name" value="{{ old('name', auth('customer')->user()->name) }}" required class="w-full border-gold-200">
            <input type="email" name="email" value="{{ old('email', auth('customer')->user()->email) }}" required class="w-full border-gold-200">
            <input type="tel" name="phone" value="{{ old('phone', auth('customer')->user()->phone) }}" class="w-full border-gold-200">
            <input type="password" name="password" placeholder="New password (leave blank to keep current)" class="w-full border-gold-200">
            <input type="password" name="password_confirmation" placeholder="Confirm new password" class="w-full border-gold-200">
            <button class="bg-ink text-cream px-6 py-3 text-xs uppercase tracking-widest2">Save Changes</button>
        </form>
    </div>
</div>
@endsection
