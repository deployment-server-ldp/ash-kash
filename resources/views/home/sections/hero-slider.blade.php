@php $slides = \App\Models\Slider::active()->get(); @endphp

@if ($slides->isNotEmpty())
<section
    x-data="{
        active: 0,
        count: {{ $slides->count() }},
        timer: null,
        start() {
            this.timer = setInterval(() => { this.active = (this.active + 1) % this.count }, {{ $slides->first()->duration_ms ?? 6000 }});
        }
    }"
    x-init="start()"
    class="relative overflow-hidden h-[70vh] min-h-[420px] max-h-[820px] bg-sand"
>
    @foreach ($slides as $i => $slide)
        <div x-show="active === {{ $i }}" x-transition:enter="transition ease-out duration-700" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" class="absolute inset-0" style="{{ $i === 0 ? '' : 'display:none;' }}">
            <picture>
                @if ($slide->mobile_image)
                    <source media="(max-width: 767px)" srcset="{{ asset('storage/'.$slide->mobile_image) }}">
                @endif
                <img src="{{ asset('storage/'.$slide->desktop_image) }}" alt="{{ $slide->title }}" class="w-full h-full object-cover" @if($i===0) fetchpriority="high" @endif>
            </picture>
            <div class="absolute inset-0 bg-ink" style="opacity: {{ $slide->overlay_opacity / 100 }}"></div>

            <div class="absolute inset-0 flex items-center {{ $slide->text_align === 'center' ? 'justify-center text-center' : ($slide->text_align === 'right' ? 'justify-end text-right' : 'justify-start text-left') }}">
                <div class="max-w-xl px-6 sm:px-12 text-cream">
                    @if ($slide->tag)
                        <p class="text-xs uppercase tracking-widest2 mb-3">{{ $slide->tag }}</p>
                    @endif
                    @if ($slide->title)
                        <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">{{ $slide->title }}</h1>
                    @endif
                    @if ($slide->subtitle)
                        <p class="text-lg mb-2">{{ $slide->subtitle }}</p>
                    @endif
                    @if ($slide->description)
                        <p class="text-cream/80 mb-6">{{ $slide->description }}</p>
                    @endif
                    @if ($slide->button_text)
                        <a href="{{ $slide->button_url ?? route('shop.index') }}" class="inline-block bg-cream text-ink px-8 py-3.5 uppercase tracking-widest2 text-xs hover:bg-gold-300 transition">
                            {{ $slide->button_text }}
                        </a>
                    @endif
                </div>
            </div>
        </div>
    @endforeach

    @if ($slides->count() > 1)
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            @foreach ($slides as $i => $slide)
                <button @click="active = {{ $i }}" class="w-8 h-0.5" :class="active === {{ $i }} ? 'bg-cream' : 'bg-cream/40'"></button>
            @endforeach
        </div>
    @endif
</section>
@endif
