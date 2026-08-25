<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingZone;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class CartService
{
    protected ?Cart $cart = null;

    public function current(): Cart
    {
        if ($this->cart) {
            return $this->cart;
        }

        $customerId = Auth::guard('customer')->id();

        if ($customerId) {
            $cart = Cart::query()->firstOrCreate(
                ['customer_id' => $customerId],
                ['session_id' => Session::getId(), 'currency_code' => currency()->current()->code]
            );
        } else {
            $sessionId = Session::get('cart_session_id') ?? Str::uuid()->toString();
            Session::put('cart_session_id', $sessionId);

            $cart = Cart::query()->firstOrCreate(
                ['session_id' => $sessionId, 'customer_id' => null],
                ['currency_code' => currency()->current()->code]
            );
        }

        return $this->cart = $cart->load('items.product', 'items.variant.optionValues');
    }

    /**
     * Merge a guest session cart into the customer's cart after login.
     */
    public function mergeGuestCartIntoCustomer(int $customerId): void
    {
        $sessionId = Session::get('cart_session_id');

        if (! $sessionId) {
            return;
        }

        $guestCart = Cart::query()->where('session_id', $sessionId)->whereNull('customer_id')->first();

        if (! $guestCart) {
            return;
        }

        $customerCart = Cart::query()->firstOrCreate(['customer_id' => $customerId]);

        foreach ($guestCart->items as $item) {
            $existing = $customerCart->items()
                ->where('product_id', $item->product_id)
                ->where('product_variant_id', $item->product_variant_id)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $item->quantity);
            } else {
                $item->cart_id = $customerCart->id;
                $item->save();
            }
        }

        $guestCart->delete();
        $this->cart = null;
    }

    public function addItem(Product $product, int $quantity = 1, ?ProductVariant $variant = null): CartItem
    {
        $cart = $this->current();

        $available = $variant ? $variant->inventory_quantity : $product->inventory_quantity;
        $tracked = $product->track_inventory;

        $existing = $cart->items()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant?->id)
            ->first();

        $newQuantity = ($existing?->quantity ?? 0) + $quantity;

        if ($tracked && $newQuantity > $available) {
            throw new \RuntimeException("Only {$available} left in stock.");
        }

        $unitPrice = $variant?->effective_price ?? (float) $product->price;

        if ($existing) {
            $existing->update(['quantity' => $newQuantity, 'price_snapshot' => $unitPrice]);

            return $existing;
        }

        return $cart->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
            'quantity' => $quantity,
            'price_snapshot' => $unitPrice,
        ]);
    }

    public function updateQuantity(CartItem $item, int $quantity): void
    {
        if ($quantity <= 0) {
            $item->delete();

            return;
        }

        $product = $item->product;
        $variant = $item->variant;
        $available = $variant ? $variant->inventory_quantity : $product->inventory_quantity;

        if ($product->track_inventory && $quantity > $available) {
            throw new \RuntimeException("Only {$available} left in stock.");
        }

        $item->update(['quantity' => $quantity]);
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function applyCoupon(string $code): Coupon
    {
        $coupon = Coupon::query()->where('code', strtoupper($code))->first();

        if (! $coupon || ! $coupon->isCurrentlyValid()) {
            throw new \RuntimeException('This coupon is invalid or has expired.');
        }

        $cart = $this->current();

        if ($coupon->min_order_amount && $cart->subtotal < (float) $coupon->min_order_amount) {
            throw new \RuntimeException('Minimum order amount not met for this coupon.');
        }

        $cart->update(['coupon_code' => $coupon->code]);

        return $coupon;
    }

    public function removeCoupon(): void
    {
        $this->current()->update(['coupon_code' => null]);
    }

    /**
     * Full pricing breakdown in the store BASE currency.
     */
    public function totals(?string $countryCode = null): array
    {
        $cart = $this->current();
        $subtotal = $cart->subtotal;

        $coupon = $cart->coupon_code ? Coupon::query()->where('code', $cart->coupon_code)->first() : null;
        $discount = 0.0;
        $freeShippingCoupon = false;

        if ($coupon && $coupon->isCurrentlyValid()) {
            $discount = $coupon->calculateDiscount($subtotal);
            $freeShippingCoupon = $coupon->type === 'free_shipping';
        }

        $zone = ShippingZone::forCountry($countryCode ?? config('shop.default_country'));
        $method = $zone?->activeMethods()->first();
        $shipping = 0.0;

        if ($method && ! $freeShippingCoupon) {
            $shipping = $method->costFor($subtotal - $discount);
        }

        $tax = 0.0;
        $grandTotal = max(0, $subtotal - $discount) + $shipping + $tax;

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'shipping_method' => $method,
            'tax' => $tax,
            'grand_total' => $grandTotal,
            'coupon' => $coupon,
        ];
    }

    public function clear(): void
    {
        $this->current()->items()->delete();
        $this->current()->update(['coupon_code' => null]);
    }

    public function itemsCount(): int
    {
        return $this->current()->items_count;
    }
}
