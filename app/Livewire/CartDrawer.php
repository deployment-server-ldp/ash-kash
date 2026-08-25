<?php

namespace App\Livewire;

use App\Models\CartItem;
use App\Services\CartService;
use Livewire\Attributes\On;
use Livewire\Component;

class CartDrawer extends Component
{
    public bool $open = false;

    #[On('open-cart-drawer')]
    public function openDrawer(): void
    {
        $this->open = true;
    }

    public function close(): void
    {
        $this->open = false;
    }

    #[On('cart-updated')]
    public function refreshCart(): void
    {
        // no-op, triggers re-render
    }

    public function increment(int $itemId): void
    {
        $item = CartItem::find($itemId);
        if ($item) {
            app(CartService::class)->updateQuantity($item, $item->quantity + 1);
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

    public function render()
    {
        $cart = app(CartService::class)->current();

        return view('livewire.cart-drawer', [
            'items' => $cart->items,
            'subtotal' => $cart->subtotal,
        ]);
    }
}
