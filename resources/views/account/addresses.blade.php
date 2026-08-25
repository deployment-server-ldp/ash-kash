@extends('layouts.app')

@section('title', 'My Addresses')

@section('content')
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
    <aside>@include('partials.account-nav')</aside>
    <div class="lg:col-span-3" x-data="{ showForm: false }">
        <div class="flex items-center justify-between mb-8">
            <h1 class="font-serif text-3xl">My Addresses</h1>
            <button @click="showForm = !showForm" class="text-xs uppercase tracking-widest2 border border-ink px-4 py-2 hover:bg-ink hover:text-cream">+ Add Address</button>
        </div>

        <div x-show="showForm" x-cloak class="border border-gold-100 p-6 mb-8">
            <form method="POST" action="{{ route('account.addresses.store') }}" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @csrf
                <input type="text" name="label" placeholder="Label (e.g. Home)" class="border-gold-200">
                <input type="text" name="full_name" placeholder="Full name" required class="border-gold-200">
                <input type="tel" name="phone" placeholder="Phone" required class="border-gold-200">
                <input type="text" name="country_code" maxlength="2" placeholder="Country code (e.g. PK)" required class="border-gold-200 uppercase">
                <input type="text" name="state" placeholder="State/Province" class="border-gold-200">
                <input type="text" name="city" placeholder="City" required class="border-gold-200">
                <input type="text" name="address_line1" placeholder="Street address" required class="border-gold-200 sm:col-span-2">
                <input type="text" name="address_line2" placeholder="Apartment, suite (optional)" class="border-gold-200 sm:col-span-2">
                <input type="text" name="postal_code" placeholder="Postal code" class="border-gold-200">
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="is_default" value="1"> Set as default</label>
                <button class="bg-ink text-cream px-6 py-3 text-xs uppercase tracking-widest2 sm:col-span-2">Save Address</button>
            </form>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @forelse ($addresses as $address)
                <div class="border border-gold-100 p-5">
                    <div class="flex justify-between items-start">
                        <p class="text-sm font-medium">{{ $address->label }} @if($address->is_default)<span class="text-gold-600 text-xs">(Default)</span>@endif</p>
                        <form method="POST" action="{{ route('account.addresses.destroy', $address) }}" onsubmit="return confirm('Remove this address?')">
                            @csrf @method('DELETE')
                            <button class="text-ink/40 hover:text-red-600 text-xs">Remove</button>
                        </form>
                    </div>
                    <p class="text-sm text-ink/70 mt-2">{{ $address->full_name }}<br>{{ $address->address_line1 }}<br>{{ $address->city }}, {{ $address->country_code }}<br>{{ $address->phone }}</p>
                </div>
            @empty
                <p class="text-ink/50 text-sm">No saved addresses yet.</p>
            @endforelse
        </div>
    </div>
</div>
@endsection
