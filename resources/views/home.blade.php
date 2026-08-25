@extends('layouts.app')

@section('title', setting('seo_default_title', 'Premium Women\'s Fashion Boutique'))
@section('description', setting('seo_default_description'))

@push('structured_data')
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": {!! json_encode(setting('store_name', config('app.name'))) !!},
        "url": {!! json_encode(url('/')) !!}
    }
    </script>
@endpush

@section('content')
    @forelse ($sections as $section)
        @switch($section->type)
            @case('hero_slider')
                @include('home.sections.hero-slider')
                @break

            @case('featured_products')
                @include('home.sections.featured-products', ['section' => $section])
                @break

            @case('categories')
                @include('home.sections.categories', ['section' => $section])
                @break

            @case('collections')
                @include('home.sections.collections', ['section' => $section])
                @break

            @case('testimonials')
                @include('home.sections.testimonials', ['section' => $section])
                @break

            @case('brand_story')
                @include('home.sections.brand-story', ['section' => $section])
                @break

            @case('promo_banner')
                @include('home.sections.promo-banner', ['section' => $section])
                @break

            @case('newsletter')
                @include('home.sections.newsletter', ['section' => $section])
                @break

            @case('instagram')
                @include('home.sections.instagram', ['section' => $section])
                @break
        @endswitch
    @empty
        <div class="max-w-4xl mx-auto text-center py-32 px-6">
            <h1 class="font-serif text-4xl mb-4">Welcome to {{ setting('store_name', config('app.name')) }}</h1>
            <p class="text-ink/60 mb-8">Homepage sections haven't been configured yet — add them from the admin panel under Content → Homepage sections.</p>
            <a href="{{ route('shop.index') }}" class="inline-block bg-ink text-cream px-8 py-3 uppercase tracking-widest2 text-xs">Shop Now</a>
        </div>
    @endforelse
@endsection
