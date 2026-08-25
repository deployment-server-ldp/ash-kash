<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;

class BlogController extends Controller
{
    public function index()
    {
        $posts = BlogPost::published()->with('category')->latest('published_at')->paginate(9);

        return view('blog.index', compact('posts'));
    }

    public function show(BlogPost $blogPost)
    {
        abort_unless($blogPost->is_published, 404);

        $related = BlogPost::published()
            ->where('id', '!=', $blogPost->id)
            ->when($blogPost->blog_category_id, fn ($q) => $q->where('blog_category_id', $blogPost->blog_category_id))
            ->limit(3)
            ->get();

        return view('blog.show', ['post' => $blogPost, 'related' => $related]);
    }
}
