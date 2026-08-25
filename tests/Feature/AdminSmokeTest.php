<?php

namespace Tests\Feature;

use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Currency::create([
            'name' => 'Pakistani Rupee',
            'code' => 'PKR',
            'symbol' => 'Rs. ',
            'exchange_rate' => 1,
            'decimal_places' => 0,
            'symbol_position' => 'before',
            'is_default' => true,
            'is_active' => true,
        ]);
    }

    public function test_admin_dashboard_and_resources_render(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $paths = [
            '/admin',
            '/admin/products',
            '/admin/categories',
            '/admin/collections',
            '/admin/brands',
            '/admin/tags',
            '/admin/orders',
            '/admin/customers',
            '/admin/coupons',
            '/admin/shipping-zones',
            '/admin/currencies',
            '/admin/countries',
            '/admin/sliders',
            '/admin/homepage-sections',
            '/admin/testimonials',
            '/admin/menus',
            '/admin/pages',
            '/admin/blog-categories',
            '/admin/blog-posts',
            '/admin/reviews',
            '/admin/size-guides',
            '/admin/users',
            '/admin/roles',
            '/admin/manage-settings',
        ];

        foreach ($paths as $path) {
            $response = $this->actingAs($user)->get($path);
            $response->assertOk();
        }
    }

    public function test_product_create_page_renders(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $this->actingAs($user)->get('/admin/products/create')->assertOk();
    }
}
