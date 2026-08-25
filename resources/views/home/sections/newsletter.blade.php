<section class="bg-ink py-20">
    <div class="max-w-xl mx-auto px-6 text-center">
        <h2 class="font-serif text-3xl text-cream mb-3">{{ $section->title ?: 'Join the inner circle' }}</h2>
        <p class="text-cream/70 mb-8">{{ $section->subtitle ?: 'Sign up for early access to new collections and exclusive offers.' }}</p>
        <form method="POST" action="{{ route('newsletter.subscribe') }}" class="flex flex-col sm:flex-row gap-3">
            @csrf
            <input type="email" name="email" required placeholder="Your email address" class="flex-1 bg-transparent border border-cream/30 px-4 py-3 text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold-300">
            <button class="bg-gold-500 text-ink px-8 py-3 uppercase tracking-widest2 text-xs hover:bg-gold-400">Subscribe</button>
        </form>
    </div>
</section>
