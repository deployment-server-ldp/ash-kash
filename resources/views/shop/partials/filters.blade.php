@php
    $sizes = \App\Models\ProductOptionValue::whereHas('option', fn($q) => $q->where('name', 'Size'))->distinct('value')->pluck('value')->unique();
    $colors = \App\Models\ProductOptionValue::whereHas('option', fn($q) => $q->where('name', 'Color'))->get()->unique('value');
@endphp

<form method="GET" class="space-y-8">
    @if (!$category && !$collection)
        <div>
            <p class="text-xs uppercase tracking-widest2 text-ink/50 mb-3">Category</p>
            <div class="space-y-2">
                @foreach ($categories as $cat)
                    <label class="flex items-center gap-2 text-sm text-ink/70">
                        <input type="radio" name="category" value="{{ $cat->slug }}" @checked(request('category') === $cat->slug) onchange="this.form.submit()">
                        {{ $cat->name }}
                    </label>
                @endforeach
            </div>
        </div>
    @endif

    <div>
        <p class="text-xs uppercase tracking-widest2 text-ink/50 mb-3">Price</p>
        <div class="flex items-center gap-2">
            <input type="number" name="min_price" value="{{ request('min_price') }}" placeholder="Min" class="w-1/2 text-sm border-gold-200 focus:border-ink focus:ring-0">
            <input type="number" name="max_price" value="{{ request('max_price') }}" placeholder="Max" class="w-1/2 text-sm border-gold-200 focus:border-ink focus:ring-0">
        </div>
    </div>

    @if ($sizes->isNotEmpty())
        <div>
            <p class="text-xs uppercase tracking-widest2 text-ink/50 mb-3">Size</p>
            <div class="flex flex-wrap gap-2">
                @foreach ($sizes as $size)
                    <label>
                        <input type="radio" name="size" value="{{ $size }}" class="peer sr-only" @checked(request('size') === $size) onchange="this.form.submit()">
                        <span class="block px-3 py-1.5 border border-gold-200 text-xs peer-checked:bg-ink peer-checked:text-cream cursor-pointer">{{ $size }}</span>
                    </label>
                @endforeach
            </div>
        </div>
    @endif

    @if ($colors->isNotEmpty())
        <div>
            <p class="text-xs uppercase tracking-widest2 text-ink/50 mb-3">Color</p>
            <div class="flex flex-wrap gap-2">
                @foreach ($colors as $color)
                    <label title="{{ $color->value }}">
                        <input type="radio" name="color" value="{{ $color->value }}" class="peer sr-only" @checked(request('color') === $color->value) onchange="this.form.submit()">
                        <span class="block w-7 h-7 rounded-full border-2 peer-checked:border-ink border-transparent" style="{{ $color->hex_value ? 'background:'.$color->hex_value : '' }}"></span>
                    </label>
                @endforeach
            </div>
        </div>
    @endif

    <div class="space-y-2">
        <label class="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" name="in_stock" value="1" @checked(request('in_stock')) onchange="this.form.submit()"> In Stock Only
        </label>
        <label class="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" name="on_sale" value="1" @checked(request('on_sale')) onchange="this.form.submit()"> On Sale
        </label>
    </div>

    <a href="{{ url()->current() }}" class="block text-xs text-gold-600 underline">Clear all filters</a>
</form>
