<nav class="space-y-1">
    <a href="{{ route('account.dashboard') }}" class="block px-4 py-2.5 text-sm {{ request()->routeIs('account.dashboard') ? 'bg-ink text-cream' : 'text-ink/70 hover:bg-sand' }}">Dashboard</a>
    <a href="{{ route('account.orders') }}" class="block px-4 py-2.5 text-sm {{ request()->routeIs('account.orders*') ? 'bg-ink text-cream' : 'text-ink/70 hover:bg-sand' }}">Orders</a>
    <a href="{{ route('account.addresses') }}" class="block px-4 py-2.5 text-sm {{ request()->routeIs('account.addresses') ? 'bg-ink text-cream' : 'text-ink/70 hover:bg-sand' }}">Addresses</a>
    <a href="{{ route('wishlist.index') }}" class="block px-4 py-2.5 text-sm {{ request()->routeIs('wishlist.index') ? 'bg-ink text-cream' : 'text-ink/70 hover:bg-sand' }}">Wishlist</a>
    <a href="{{ route('account.profile') }}" class="block px-4 py-2.5 text-sm {{ request()->routeIs('account.profile') ? 'bg-ink text-cream' : 'text-ink/70 hover:bg-sand' }}">Profile</a>
    <form method="POST" action="{{ route('account.logout') }}">
        @csrf
        <button class="block w-full text-left px-4 py-2.5 text-sm text-ink/70 hover:bg-sand">Sign Out</button>
    </form>
</nav>
