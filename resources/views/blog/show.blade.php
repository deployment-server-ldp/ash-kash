@extends('layouts.app')

@section('title', $post->seo_title ?: $post->title)
@section('description', $post->seo_description ?: $post->excerpt)

@push('structured_data')
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": {!! json_encode($post->title) !!},
        "datePublished": {!! json_encode($post->published_at?->toIso8601String()) !!},
        "author": {"@type": "Person", "name": {!! json_encode($post->author->name ?? config('app.name')) !!}}
    }
    </script>
@endpush

@section('content')
<article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    @if ($post->category)
        <p class="text-xs uppercase tracking-widest2 text-gold-600 mb-3">{{ $post->category->name }}</p>
    @endif
    <h1 class="font-serif text-4xl mb-4">{{ $post->title }}</h1>
    <p class="text-sm text-ink/50 mb-8">{{ $post->published_at?->format('F j, Y') }} @if($post->author) · {{ $post->author->name }} @endif</p>

    @if ($post->featured_image)
        <img src="{{ asset('storage/'.$post->featured_image) }}" alt="{{ $post->title }}" class="w-full aspect-[16/9] object-cover mb-10">
    @endif

    <div class="prose prose-lg max-w-none text-ink/80">{!! $post->content !!}</div>

    @if ($related->isNotEmpty())
        <div class="mt-16 pt-10 border-t border-gold-100">
            <h2 class="font-serif text-2xl mb-6">More from the Journal</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                @foreach ($related as $item)
                    <a href="{{ route('blog.show', $item->slug) }}" class="text-sm text-ink hover:text-gold-600">{{ $item->title }}</a>
                @endforeach
            </div>
        </div>
    @endif
</article>
@endsection
