<button
    type="button"
    wire:click="toggle"
    class="w-10 h-10 flex items-center justify-center border border-gold-200 hover:border-ink transition rounded-full bg-white/80"
    aria-label="Toggle wishlist"
>
    @if ($inWishlist)
        <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21s-6.716-4.35-9.428-8.09C.55 10.243 1.2 6.6 4.2 5.1c2.1-1.05 4.35-.45 5.8 1.35C11.45 4.65 13.7 4.05 15.8 5.1c3 1.5 3.65 5.143 1.628 7.81C18.716 16.65 12 21 12 21z"/></svg>
    @else
        <svg class="w-5 h-5 text-ink/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21s-6.716-4.35-9.428-8.09C.55 10.243 1.2 6.6 4.2 5.1c2.1-1.05 4.35-.45 5.8 1.35C11.45 4.65 13.7 4.05 15.8 5.1c3 1.5 3.65 5.143 1.628 7.81C18.716 16.65 12 21 12 21z"/></svg>
    @endif
</button>
