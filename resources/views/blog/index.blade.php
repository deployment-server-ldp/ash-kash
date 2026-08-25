@extends('layouts.app')

@section('title', 'Journal')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="font-serif text-4xl mb-10">The Journal</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        @forelse ($posts as $post)
            <a href="{{ route('blog.show', $post->slug) }}" class="group">
                @if ($post->featured_image)
                    <div class="aspect-[4/3] overflow-hidden bg-sand mb-4">
                        <img src="{{ asset('storage/'.$post->featured_image) }}" alt="{{ $post->title }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    </div>
                @endif
                @if ($post->category)
                    <p class="text-xs uppercase tracking-widest2 text-gold-600 mb-2">{{ $post->category->name }}</p>
                @endif
                <h2 class="font-serif text-xl text-ink group-hover:text-gold-600">{{ $post->title }}</h2>
                @if ($post->excerpt)
                    <p class="text-sm text-ink/60 mt-2">{{ $post->excerpt }}</p>
                @endif
            </a>
        @empty
            <p class="text-ink/50">No journal entries yet.</p>
        @endforelse
    </div>

    <div class="mt-12">{{ $posts->links() }}</div>
</div>
@endsection
