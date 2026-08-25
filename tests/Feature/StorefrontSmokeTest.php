<?php

namespace Tests\Feature;

use App\Models\Currency;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingZone;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Currency::create([
            'name' => 'Pakistani Rupee', 'code' => 'PKR', 'symbol' => 'Rs. ',
            'exchange_rate' => 1, 'decimal_places' => 0, 'symbol_position' => 'before',
            'is_default' => true, 'is_active' => true,
        ]);

        ShippingZone::create(['name' => 'Pakistan', 'countries' => ['PK'], 'is_active' => true, 'sort_order' => 0])
            ->methods()->create([
                'name' => 'Standard', 'price' => 250, 'free_shipping_threshold' => 5000,
                'estimated_days_min' => 2, 'estimated_days_max' => 4, 'is_active' => true, 'sort_order' => 0,
            ]);
    }

    public function test_storefront_pages_load(): void
    {
        $product = Product::factory()->create(['status' => 'active', 'inventory_quantity' => 10]);

        foreach (['/', '/shop', '/blog', '/about', '/contact', '/cart', '/sitemap.xml', '/robots.txt', "/product/{$product->slug}"] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_full_cart_and_cod_checkout_creates_order_and_decrements_stock(): void
    {
        $product = Product::factory()->create([
            'status' => 'active',
            'price' => 5000,
            'track_inventory' => true,
            'inventory_quantity' => 10,
        ]);

        app(CartService::class)->addItem($product, 2);

        $response = $this->post('/checkout', [
            'name' => 'Test Customer',
            'phone' => '+923001234567',
            'country_code' => 'PK',
            'city' => 'Karachi',
            'address_line1' => '123 Test Street',
        ]);

        $order = Order::first();

        $this->assertNotNull($order, 'Order was not created.');
        $response->assertRedirect(route('checkout.confirmation', $order->order_number));

        $this->assertEquals('pending', $order->status);
        $this->assertEquals('cod', $order->payment_method);
        $this->assertEquals(2, $order->items()->sum('quantity'));
        $this->assertEquals(10000, (float) $order->subtotal);
        $this->assertEquals(10000, (float) $order->grand_total); // subtotal already exceeds the free shipping threshold

        $this->assertEquals(8, $product->fresh()->inventory_quantity, 'Stock was not decremented.');
        $this->assertDatabaseHas('inventory_logs', ['product_id' => $product->id, 'quantity_change' => -2]);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'status' => 'pending']);

        // Cart should be emptied after checkout.
        $this->assertEquals(0, app(CartService::class)->itemsCount());
    }

    public function test_checkout_rejects_when_stock_insufficient(): void
    {
        $product = Product::factory()->create([
            'status' => 'active', 'price' => 1000, 'track_inventory' => true, 'inventory_quantity' => 1,
        ]);

        app(CartService::class)->addItem($product, 1);
        $product->update(['inventory_quantity' => 0]); // stock sold out after adding to cart

        $response = $this->post('/checkout', [
            'name' => 'Test Customer',
            'phone' => '+923001234567',
            'country_code' => 'PK',
            'city' => 'Karachi',
            'address_line1' => '123 Test Street',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('orders', 0);
    }
}
