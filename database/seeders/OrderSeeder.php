<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::all();
        $products = Product::with('variants')->get();
        $statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'cancelled'];

        foreach (range(1, 12) as $n) {
            $customer = $customers->random();
            $status = $statuses[array_rand($statuses)];
            $createdAt = now()->subDays(random_int(0, 29));

            $itemCount = random_int(1, 3);
            $items = $products->random($itemCount);

            $subtotal = 0;
            $lineItems = [];

            foreach ($items as $product) {
                $variant = $product->variants->isNotEmpty() ? $product->variants->random() : null;
                $qty = random_int(1, 2);
                $price = (float) ($variant?->price ?? $product->price);
                $subtotal += $price * $qty;

                $lineItems[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'variant_title' => $variant?->display_title,
                    'sku' => $variant?->sku ?? $product->sku,
                    'image' => $product->primary_image_url,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'total_price' => $price * $qty,
                ];
            }

            $shipping = 250;
            $discount = 0;
            $grandTotal = $subtotal + $shipping - $discount;

            $order = Order::create([
                'customer_id' => $customer->id,
                'status' => $status,
                'customer_name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'currency_code' => 'PKR',
                'exchange_rate_snapshot' => 1,
                'subtotal' => $subtotal,
                'discount_total' => $discount,
                'shipping_total' => $shipping,
                'tax_total' => 0,
                'grand_total' => $grandTotal,
                'shipping_address' => [
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'country_code' => 'PK',
                    'city' => 'Karachi',
                    'address_line1' => '123 Boutique Street',
                ],
                'shipping_method_name' => 'Standard Delivery',
                'payment_method' => 'cod',
                'payment_status' => $status === 'delivered' ? 'paid' : 'pending',
                'ip_address' => '127.0.0.1',
                'country_code' => 'PK',
                'is_demo' => true,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            foreach ($lineItems as $item) {
                $order->items()->create($item);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'note' => 'Order placed by customer (Cash on Delivery).',
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            if ($status !== 'pending') {
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => $status,
                    'note' => 'Status updated.',
                    'created_at' => $createdAt->copy()->addHours(random_int(2, 48)),
                    'updated_at' => $createdAt,
                ]);
            }
        }
    }
}
