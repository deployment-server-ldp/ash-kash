<?php

namespace App\Livewire;

use App\Models\CartItem;
use App\Services\CartService;
use Livewire\Component;

class CartPage extends Component
{
    public string $couponCode = '';

    public ?string $couponError = null;

    public function increment(int $itemId): void
    {
        $item = CartItem::find($itemId);
        if ($item) {
            try {
                app(CartService::class)->updateQuantity($item, $item->quantity + 1);
            } catch (\RuntimeException $e) {
                $this->addError('stock', $e->getMessage());
            }
        }
    }

    public function decrement(int $itemId): void
    {
        $item = CartItem::find($itemId);
        if ($item) {
            app(CartService::class)->updateQuantity($item, $item->quantity - 1);
        }
    }

    public function remove(int $itemId): void
    {
        $item = CartItem::find($itemId);
        if ($item) {
            app(CartService::class)->removeItem($item);
        }
    }

    public function applyCoupon(): void
    {
        $this->couponError = null;

        try {
            app(CartService::class)->applyCoupon($this->couponCode);
            $this->couponCode = '';
        } catch (\RuntimeException $e) {
            $this->couponError = $e->getMessage();
        }
    }

    public function removeCoupon(): void
    {
        app(CartService::class)->removeCoupon();
    }

    public function render()
    {
        $cart = app(CartService::class)->current();
        $totals = app(CartService::class)->totals();

        return view('livewire.cart-page', [
            'items' => $cart->items,
            'totals' => $totals,
        ]);
    }
}
