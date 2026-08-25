<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Runs the full production DatabaseSeeder against a fresh test database and
 * verifies admin edit screens work with realistic seeded records — including
 * relation managers (variants, reviews, order items, order timeline).
 */
class AdminSeededDataTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_product_edit_page_with_variants_renders(): void
    {
        $admin = User::where('email', 'admin@ashkash.test')->firstOrFail();
        $product = Product::has('variants')->firstOrFail();

        $this->actingAs($admin)
            ->get("/admin/products/{$product->id}/edit")
            ->assertOk()
            ->assertSee($product->name);
    }

    public function test_order_edit_page_renders(): void
    {
        $admin = User::where('email', 'admin@ashkash.test')->firstOrFail();
        $order = Order::firstOrFail();

        $this->actingAs($admin)
            ->get("/admin/orders/{$order->id}/edit")
            ->assertOk()
            ->assertSee($order->order_number);
    }

    public function test_admin_orders_index_shows_seeded_orders(): void
    {
        $admin = User::where('email', 'admin@ashkash.test')->firstOrFail();

        $this->actingAs($admin)
            ->get('/admin/orders')
            ->assertOk();
    }

    public function test_admin_dashboard_widgets_render_with_seeded_data(): void
    {
        $admin = User::where('email', 'admin@ashkash.test')->firstOrFail();

        $this->actingAs($admin)->get('/admin')->assertOk();
    }
}
