<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function dashboard()
    {
        $customer = Auth::guard('customer')->user();
        $recentOrders = $customer->orders()->latest()->limit(5)->get();

        return view('account.dashboard', compact('customer', 'recentOrders'));
    }

    public function orders()
    {
        $orders = Auth::guard('customer')->user()->orders()->latest()->paginate(10);

        return view('account.orders', compact('orders'));
    }

    public function orderShow(Order $order)
    {
        abort_unless($order->customer_id === Auth::guard('customer')->id(), 403);
        $order->load('items', 'statusHistories');

        return view('account.order-show', compact('order'));
    }

    public function addresses()
    {
        $addresses = Auth::guard('customer')->user()->addresses()->get();

        return view('account.addresses', compact('addresses'));
    }

    public function storeAddress(Request $request)
    {
        $data = $request->validate([
            'label' => 'nullable|string|max:255',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'country_code' => 'required|string|size:2',
            'state' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        $customer = Auth::guard('customer')->user();

        if ($request->boolean('is_default')) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $customer->addresses()->create($data + ['is_default' => $request->boolean('is_default')]);

        return back()->with('success', 'Address saved.');
    }

    public function destroyAddress(CustomerAddress $address)
    {
        abort_unless($address->customer_id === Auth::guard('customer')->id(), 403);
        $address->delete();

        return back()->with('success', 'Address removed.');
    }

    public function profile()
    {
        return view('account.profile');
    }

    public function updateProfile(Request $request)
    {
        $customer = Auth::guard('customer')->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers,email,'.$customer->id,
            'phone' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $customer->update($data);

        return back()->with('success', 'Profile updated.');
    }
}
