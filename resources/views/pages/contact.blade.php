@extends('layouts.app')

@section('title', 'Contact Us')

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h1 class="font-serif text-4xl mb-8">Contact Us</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div>
            <p class="text-sm text-ink/70 mb-2"><strong>Email:</strong> {{ setting('contact_email', 'hello@example.com') }}</p>
            <p class="text-sm text-ink/70 mb-2"><strong>Phone:</strong> {{ setting('contact_phone', '—') }}</p>
            <p class="text-sm text-ink/70"><strong>Address:</strong> {{ setting('contact_address', '—') }}</p>
        </div>
        <form method="POST" action="{{ route('contact.submit') }}" class="space-y-4">
            @csrf
            <input type="text" name="name" placeholder="Your name" required class="w-full border-gold-200">
            <input type="email" name="email" placeholder="Your email" required class="w-full border-gold-200">
            <textarea name="message" rows="5" placeholder="Message" required class="w-full border-gold-200"></textarea>
            <button class="bg-ink text-cream px-6 py-3 text-xs uppercase tracking-widest2">Send Message</button>
        </form>
    </div>
</div>
@endsection
