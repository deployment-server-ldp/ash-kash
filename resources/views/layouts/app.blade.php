<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ trim($__env->yieldContent('title') . (View::hasSection('title') ? ' | ' : '') . setting('store_name', config('app.name'))) }}</title>
    <meta name="description" content="@yield('description', setting('seo_default_description', 'Premium women\'s fashion boutique.'))">
    @hasSection('canonical')
        <link rel="canonical" href="@yield('canonical')">
    @endif
    <meta property="og:title" content="@yield('title', setting('store_name', config('app.name')))">
    <meta property="og:description" content="@yield('description', setting('seo_default_description'))">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    @hasSection('og_image')
        <meta property="og:image" content="@yield('og_image')">
    @endif
    <meta name="twitter:card" content="summary_large_image">
    @stack('structured_data')

    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
    @stack('styles')
</head>
<body class="bg-cream text-ink font-sans antialiased" x-data="{ mobileMenu: false, searchOpen: false }">

    {{-- Announcement bar --}}
    <div class="bg-ink text-cream text-center text-xs tracking-widest2 uppercase py-2.5 px-4">
        Free shipping on orders above {{ money(5000) }} · Cash on Delivery available
    </div>

    <header class="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-gold-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                {{-- Mobile menu trigger --}}
                <button class="lg:hidden text-ink" @click="mobileMenu = true" aria-label="Open menu">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" /></svg>
                </button>

                <a href="{{ route('home') }}" class="font-serif text-2xl md:text-3xl tracking-wide text-ink">
                    {{ setting('store_name', config('app.name')) }}
                </a>

                {{-- Desktop nav --}}
                <nav class="hidden lg:flex items-center gap-8">
                    @foreach (\App\Models\Menu::with('items')->where('location', 'header')->first()?->items ?? [] as $item)
                        @if ($item->is_active)
                            <div class="relative group">
                                <a href="{{ $item->resolved_url }}" class="text-sm uppercase tracking-widest2 text-ink/80 hover:text-ink">{{ $item->label }}</a>
                                @if ($item->children->isNotEmpty())
                                    <div class="absolute left-0 top-full pt-3 hidden group-hover:block min-w-[200px]">
                                        <div class="bg-white shadow-lg border border-gold-100 py-2">
                                            @foreach ($item->children as $child)
                                                <a href="{{ $child->resolved_url }}" class="block px-4 py-2 text-sm text-ink/70 hover:bg-sand hover:text-ink">{{ $child->label }}</a>
                                            @endforeach
                                        </div>
                                    </div>
                                @endif
                            </div>
                        @endif
                    @endforeach
                </nav>

                <div class="flex items-center gap-2 sm:gap-4">
                    <button @click="searchOpen = true" class="text-ink/70 hover:text-ink" aria-label="Search">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" /></svg>
                    </button>

                    @include('partials.currency-selector')

                    <a href="{{ Auth::guard('customer')->check() ? route('account.dashboard') : route('account.login') }}" class="hidden sm:block text-ink/70 hover:text-ink" aria-label="Account">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    </a>

                    <a href="{{ route('wishlist.index') }}" class="hidden sm:block text-ink/70 hover:text-ink" aria-label="Wishlist">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21s-6.716-4.35-9.428-8.09C.55 10.243 1.2 6.6 4.2 5.1c2.1-1.05 4.35-.45 5.8 1.35C11.45 4.65 13.7 4.05 15.8 5.1c3 1.5 3.65 5.143 1.628 7.81C18.716 16.65 12 21 12 21z" /></svg>
                    </a>

                    <button @click="$dispatch('open-cart-drawer')" class="relative text-ink/70 hover:text-ink" aria-label="Cart">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.665 2.615-7.076a.75.75 0 00-.727-.934H5.106M7.5 14.25L5.106 5.25M7.5 14.25L5.25 18M14.25 18a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM6 18a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    </header>

    {{-- Search overlay --}}
    <div x-show="searchOpen" x-cloak x-transition class="fixed inset-0 z-50 bg-cream/98 backdrop-blur" style="display:none;">
        <div class="max-w-2xl mx-auto pt-24 px-6">
            <button @click="searchOpen = false" class="float-right text-ink/60 hover:text-ink">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div class="clear-both pt-8">
                @livewire('mini-search')
            </div>
        </div>
    </div>

    {{-- Mobile menu drawer --}}
    <div x-show="mobileMenu" x-cloak class="fixed inset-0 z-50" style="display:none;">
        <div x-show="mobileMenu" x-transition.opacity @click="mobileMenu = false" class="absolute inset-0 bg-ink/40"></div>
        <div x-show="mobileMenu" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="-translate-x-full" x-transition:enter-end="translate-x-0" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="translate-x-0" x-transition:leave-end="-translate-x-full" class="absolute left-0 top-0 h-full w-80 bg-cream shadow-2xl overflow-y-auto">
            <div class="flex items-center justify-between px-6 py-5 border-b border-gold-200">
                <span class="font-serif text-xl">Menu</span>
                <button @click="mobileMenu = false" aria-label="Close menu"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <nav class="px-6 py-4">
                @foreach (\App\Models\Menu::with('items.children')->where('location', 'header')->first()?->items ?? [] as $item)
                    @if ($item->is_active)
                        <div class="border-b border-gold-100 py-3">
                            <a href="{{ $item->resolved_url }}" class="block uppercase tracking-widest2 text-sm text-ink">{{ $item->label }}</a>
                            @foreach ($item->children as $child)
                                <a href="{{ $child->resolved_url }}" class="block pl-4 py-2 text-sm text-ink/60">{{ $child->label }}</a>
                            @endforeach
                        </div>
                    @endif
                @endforeach
                <div class="py-4">
                    <a href="{{ Auth::guard('customer')->check() ? route('account.dashboard') : route('account.login') }}" class="block py-2 text-sm text-ink/70">My Account</a>
                    <a href="{{ route('wishlist.index') }}" class="block py-2 text-sm text-ink/70">Wishlist</a>
                </div>
            </nav>
        </div>
    </div>

    @livewire('cart-drawer')

    <main>
        @if (session('success'))
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div class="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">{{ session('success') }}</div>
            </div>
        @endif
        @if (session('error'))
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div class="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">{{ session('error') }}</div>
            </div>
        @endif

        @yield('content')
    </main>

    @include('partials.footer')

    @livewireScripts
    @stack('scripts')
</body>
</html>
