<?php

namespace App\Http\Controllers;

use App\Models\HomepageSection;
use App\Models\Product;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $sections = HomepageSection::active()->get();

        return view('home', compact('sections'));
    }

    public function newsletter(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Architected for a real provider (Mailchimp/Klaviyo/Brevo) via settings.newsletter_provider.
        // For now we just acknowledge the subscription — wire up the provider's API here.

        return back()->with('success', 'Thanks for subscribing!');
    }

    public static function resolveFeaturedProducts(HomepageSection $section)
    {
        $settings = $section->settings ?? [];
        $limit = (int) ($settings['limit'] ?? 8);

        return match ($settings['source'] ?? 'latest') {
            'best_seller' => Product::active()->bestSeller()->latest()->limit($limit)->get(),
            'featured' => Product::active()->featured()->latest()->limit($limit)->get(),
            'sale' => Product::active()->onSale()->latest()->limit($limit)->get(),
            'custom' => Product::active()->whereIn('id', $settings['product_ids'] ?? [])->get(),
            default => Product::active()->latest()->limit($limit)->get(),
        };
    }
}
