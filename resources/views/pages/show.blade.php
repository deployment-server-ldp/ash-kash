@extends('layouts.app')

@section('title', $page->seo_title ?: $page->title)
@section('description', $page->seo_description)

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h1 class="font-serif text-4xl mb-8">{{ $page->title }}</h1>
    <div class="prose prose-lg max-w-none text-ink/80">{!! $page->content !!}</div>
</div>
@endsection
