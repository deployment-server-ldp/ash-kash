<footer class="bg-ink text-cream/80 mt-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
            <p class="font-serif text-2xl text-cream mb-4">{{ setting('store_name', config('app.name')) }}</p>
            <p class="text-sm leading-relaxed">{{ setting('footer_about', 'Premium women\'s fashion — thoughtfully designed, beautifully made.') }}</p>
            <div class="flex gap-4 mt-5">
                @if ($ig = setting('social_instagram'))
                    <a href="https://instagram.com/{{ $ig }}" class="hover:text-gold-300" aria-label="Instagram">IG</a>
                @endif
                @if ($fb = setting('social_facebook'))
                    <a href="https://facebook.com/{{ $fb }}" class="hover:text-gold-300" aria-label="Facebook">FB</a>
                @endif
                @if ($tt = setting('social_tiktok'))
                    <a href="https://tiktok.com/@{{ $tt }}" class="hover:text-gold-300" aria-label="TikTok">TT</a>
                @endif
            </div>
        </div>

        <div>
            <p class="text-xs uppercase tracking-widest2 text-cream mb-4">Shop</p>
            <ul class="space-y-2 text-sm">
                @foreach (\App\Models\Category::active()->root()->orderBy('sort_order')->limit(6)->get() as $cat)
                    <li><a href="{{ route('shop.category', $cat->slug) }}" class="hover:text-gold-300">{{ $cat->name }}</a></li>
                @endforeach
            </ul>
        </div>

        <div>
            <p class="text-xs uppercase tracking-widest2 text-cream mb-4">Customer Service</p>
            <ul class="space-y-2 text-sm">
                @foreach (\App\Models\Menu::with('items')->where('location', 'footer')->first()?->items ?? [] as $item)
                    @if ($item->is_active)
                        <li><a href="{{ $item->resolved_url }}" class="hover:text-gold-300">{{ $item->label }}</a></li>
                    @endif
                @endforeach
                <li><a href="{{ route('contact') }}" class="hover:text-gold-300">Contact Us</a></li>
            </ul>
        </div>

        <div>
            <p class="text-xs uppercase tracking-widest2 text-cream mb-4">Newsletter</p>
            <p class="text-sm mb-3">Be first to know about new arrivals and offers.</p>
            <form method="POST" action="{{ route('newsletter.subscribe') }}" class="flex">
                @csrf
                <input type="email" name="email" required placeholder="Email address" class="flex-1 bg-transparent border border-cream/30 px-3 py-2 text-sm placeholder:text-cream/40 focus:outline-none focus:border-gold-300">
                <button class="bg-gold-500 text-ink px-4 text-sm uppercase tracking-widest2 hover:bg-gold-400">Join</button>
            </form>
        </div>
    </div>

    <div class="border-t border-cream/10 py-6 text-center text-xs text-cream/50">
        {{ setting('footer_copyright', '© '.date('Y').' '.setting('store_name', config('app.name')).'. All rights reserved.') }}
    </div>
</footer>
