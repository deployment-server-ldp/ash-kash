<?php

namespace App\Livewire;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class WishlistButton extends Component
{
    public Product $product;

    public bool $inWishlist = false;

    public function mount(Product $product): void
    {
        $this->product = $product;
        $this->refreshState();
    }

    protected function refreshState(): void
    {
        if (Auth::guard('customer')->check()) {
            $this->inWishlist = Wishlist::query()
                ->where('customer_id', Auth::guard('customer')->id())
                ->where('product_id', $this->product->id)
                ->exists();
        }
    }

    public function toggle()
    {
        if (! Auth::guard('customer')->check()) {
            return redirect()->route('account.login');
        }

        $customerId = Auth::guard('customer')->id();

        $existing = Wishlist::query()
            ->where('customer_id', $customerId)
            ->where('product_id', $this->product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $this->inWishlist = false;
        } else {
            Wishlist::create(['customer_id' => $customerId, 'product_id' => $this->product->id]);
            $this->inWishlist = true;
        }
    }

    public function render()
    {
        return view('livewire.wishlist-button');
    }
}
