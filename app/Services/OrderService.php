<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\InventoryLog;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Filament\Notifications\Notification as FilamentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(protected CartService $cartService) {}

    /**
     * Create a real order from the current cart. Validates stock, decrements
     * inventory, records the coupon usage and status history, then empties the cart.
     */
    public function createFromCart(array $customerData, Request $request): Order
    {
        $cart = $this->cartService->current();

        if ($cart->items->isEmpty()) {
            throw new \RuntimeException('Your cart is empty.');
        }

        $countryCode = $customerData['country_code'];
        $totals = $this->cartService->totals($countryCode);

        return DB::transaction(function () use ($cart, $customerData, $totals, $request, $countryCode) {
            // Re-validate stock inside the transaction to avoid race conditions.
            foreach ($cart->items as $item) {
                $available = $item->variant ? $item->variant->inventory_quantity : $item->product->inventory_quantity;
                if ($item->product->track_inventory && $item->quantity > $available) {
                    throw new \RuntimeException("\"{$item->product->name}\" no longer has enough stock.");
                }
            }

            $currency = currency()->current();

            $order = Order::create([
                'customer_id' => Auth::guard('customer')->id(),
                'coupon_id' => $totals['coupon']?->id,
                'coupon_code' => $totals['coupon']?->code,
                'status' => 'pending',
                'customer_name' => $customerData['name'],
                'email' => $customerData['email'] ?? null,
                'phone' => $customerData['phone'],
                'currency_code' => $currency->code,
                'exchange_rate_snapshot' => $currency->exchange_rate,
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount'],
                'shipping_total' => $totals['shipping'],
                'tax_total' => $totals['tax'],
                'grand_total' => $totals['grand_total'],
                'shipping_address' => $customerData,
                'billing_address' => $customerData,
                'shipping_method_name' => $totals['shipping_method']?->name,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'notes' => $customerData['notes'] ?? null,
                'ip_address' => $request->ip(),
                'country_code' => $countryCode,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'variant_title' => $item->variant?->display_title,
                    'sku' => $item->variant?->sku ?? $item->product->sku,
                    'image' => $item->product->primary_image_url,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->price_snapshot,
                    'total_price' => $item->price_snapshot * $item->quantity,
                ]);

                $this->decrementInventory($item);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'note' => 'Order placed by customer (Cash on Delivery).',
            ]);

            if ($totals['coupon']) {
                $totals['coupon']->increment('used_count');
                CouponUsage::create([
                    'coupon_id' => $totals['coupon']->id,
                    'customer_id' => Auth::guard('customer')->id(),
                    'order_id' => $order->id,
                    'discount_amount' => $totals['discount'],
                    'used_at' => now(),
                ]);
            }

            $this->cartService->clear();

            $this->notifyAdmins($order);

            return $order;
        });
    }

    protected function decrementInventory($item): void
    {
        if (! $item->product->track_inventory) {
            return;
        }

        if ($item->variant) {
            $item->variant->decrement('inventory_quantity', $item->quantity);
            $newQty = $item->variant->fresh()->inventory_quantity;

            InventoryLog::create([
                'product_id' => $item->product_id,
                'product_variant_id' => $item->variant_id ?? $item->product_variant_id,
                'type' => 'order',
                'quantity_change' => -$item->quantity,
                'quantity_after' => $newQty,
                'note' => 'Sold via order',
            ]);
        } else {
            $item->product->decrement('inventory_quantity', $item->quantity);
            $newQty = $item->product->fresh()->inventory_quantity;

            InventoryLog::create([
                'product_id' => $item->product_id,
                'type' => 'order',
                'quantity_change' => -$item->quantity,
                'quantity_after' => $newQty,
                'note' => 'Sold via order',
            ]);
        }

        if ($item->product->fresh()->is_low_stock) {
            $this->notifyLowStock($item->product);
        }
    }

    protected function notifyAdmins(Order $order): void
    {
        try {
            $admins = User::query()->where('is_active', true)->get();

            FilamentNotification::make()
                ->title('New order received')
                ->body("Order #{$order->order_number} — {$order->currency_code} ".number_format((float) $order->grand_total, 2))
                ->icon('heroicon-o-shopping-bag')
                ->iconColor('success')
                ->sendToDatabase($admins);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    protected function notifyLowStock(Product $product): void
    {
        try {
            $admins = User::query()->where('is_active', true)->get();

            FilamentNotification::make()
                ->title($product->total_inventory <= 0 ? 'Product out of stock' : 'Low stock warning')
                ->body("{$product->name} has {$product->total_inventory} unit(s) left.")
                ->icon('heroicon-o-exclamation-triangle')
                ->iconColor('warning')
                ->sendToDatabase($admins);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
