<?php

namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Order;
use App\Models\ShippingZone;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckoutController extends Controller
{
    public function __construct(protected CartService $cartService, protected OrderService $orderService) {}

    public function index(Request $request)
    {
        $cart = $this->cartService->current();

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your bag is empty.');
        }

        if (! config('shop.cod_enabled') && ! setting('cod_enabled', true)) {
            abort(503, 'Checkout is temporarily unavailable.');
        }

        $countryCode = $request->cookie('display_country', config('shop.default_country'));
        $totals = $this->cartService->totals($countryCode);
        $countries = Country::query()->where('is_active', true)->orderBy('name')->get();
        $shippingZones = ShippingZone::with('activeMethods')->where('is_active', true)->get();

        $customer = Auth::guard('customer')->user();
        $defaultAddress = $customer?->defaultAddress;

        return view('checkout.index', compact('cart', 'totals', 'countries', 'shippingZones', 'countryCode', 'defaultAddress'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:30',
            'country_code' => 'required|string|size:2',
            'state' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $order = $this->orderService->createFromCart($data, $request);
        } catch (\RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->route('checkout.confirmation', $order->order_number);
    }

    public function confirmation(Order $order)
    {
        $order->load('items');

        return view('checkout.confirmation', compact('order'));
    }
}
