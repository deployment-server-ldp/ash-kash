<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        if (! Auth::guard('customer')->check()) {
            return redirect()->route('account.login');
        }

        $wishlists = Wishlist::query()
            ->where('customer_id', Auth::guard('customer')->id())
            ->with('product')
            ->latest()
            ->get();

        return view('wishlist.index', compact('wishlists'));
    }
}
