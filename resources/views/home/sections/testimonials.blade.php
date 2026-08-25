@php $testimonials = \App\Models\Testimonial::active()->limit(3)->get(); @endphp

@if ($testimonials->isNotEmpty())
<section class="bg-sand py-20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
            @if ($section->title)
                <h2 class="font-serif text-3xl sm:text-4xl text-ink">{{ $section->title }}</h2>
            @else
                <h2 class="font-serif text-3xl sm:text-4xl text-ink">What our customers say</h2>
            @endif
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @foreach ($testimonials as $t)
                <div class="bg-white p-8 text-center">
                    <div class="flex justify-center gap-1 text-gold-500 mb-4">
                        @for ($i = 0; $i < $t->rating; $i++) ★ @endfor
                    </div>
                    <p class="text-ink/70 italic mb-6">&ldquo;{{ $t->content }}&rdquo;</p>
                    <p class="text-sm font-medium text-ink">{{ $t->name }}</p>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif
