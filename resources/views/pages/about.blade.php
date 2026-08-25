@extends('layouts.app')

@section('title', 'About Us')

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h1 class="font-serif text-4xl mb-8">{{ $page->title ?? 'About '.setting('store_name', config('app.name')) }}</h1>
    @if ($page)
        <div class="prose prose-lg max-w-none text-ink/80">{!! $page->content !!}</div>
    @else
        <p class="text-ink/60">{{ setting('footer_about', 'Content for this page has not been added yet — manage it from Admin → Content → Pages.') }}</p>
    @endif
</div>
@endsection
