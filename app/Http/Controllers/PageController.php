<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function show(Page $page)
    {
        abort_unless($page->is_published, 404);

        return view('pages.show', compact('page'));
    }

    public function about()
    {
        $page = Page::where('slug', 'about-us')->published()->first();

        return view('pages.about', compact('page'));
    }

    public function contact()
    {
        return view('pages.contact');
    }

    public function submitContact(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'message' => 'required|string|max:2000',
        ]);

        // Architected for a real mail provider — see EMAIL_PROVIDER in .env.
        // For now the message is simply acknowledged.

        return back()->with('success', 'Thanks for reaching out — we will get back to you soon.');
    }
}
