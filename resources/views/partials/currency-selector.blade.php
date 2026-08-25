@php $current = currency()->current(); @endphp
<div class="relative" x-data="{ open: false }">
    <button @click="open = !open" @click.outside="open = false" class="text-sm text-ink/70 hover:text-ink flex items-center gap-1">
        {{ $current->code }}
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
    </button>
    <div x-show="open" x-cloak x-transition class="absolute right-0 mt-3 w-48 bg-white border border-gold-100 shadow-lg py-2 z-50" style="display:none;">
        @foreach (currency()->all() as $c)
            <form method="POST" action="{{ route('currency.switch') }}">
                @csrf
                <input type="hidden" name="code" value="{{ $c->code }}">
                <button type="submit" class="w-full text-left px-4 py-2 text-sm hover:bg-sand {{ $c->code === $current->code ? 'text-gold-600 font-medium' : 'text-ink/70' }}">
                    {{ $c->name }} ({{ $c->code }})
                </button>
            </form>
        @endforeach
    </div>
</div>
