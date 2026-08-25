<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'body' => 'required|string|max:2000',
        ]);

        // Basic spam/duplicate guard: same email can't review the same product more than once,
        // and is rate limited to avoid rapid-fire submissions.
        $key = 'review-submit:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return back()->with('error', 'Too many review attempts. Please try again later.');
        }
        RateLimiter::hit($key, 3600);

        $duplicate = Review::query()
            ->where('product_id', $product->id)
            ->where('email', $data['email'])
            ->exists();

        if ($duplicate) {
            return back()->with('error', 'You have already reviewed this product.');
        }

        $review = $product->reviews()->create([
            ...$data,
            'customer_id' => Auth::guard('customer')->id(),
            'status' => 'pending',
            'ip_address' => $request->ip(),
        ]);

        Notification::make()
            ->title('New product review')
            ->body("{$review->name} rated \"{$product->name}\" {$review->rating}/5.")
            ->icon('heroicon-o-star')
            ->sendToDatabase(User::query()->where('is_active', true)->get());

        return back()->with('success', 'Thank you! Your review has been submitted for approval.');
    }
}
