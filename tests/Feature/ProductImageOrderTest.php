<?php

namespace Tests\Feature;

use App\Filament\Resources\ProductResource\Pages\EditProduct;
use App\Models\Currency;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Livewire\Livewire;
use Tests\TestCase;

class ProductImageOrderTest extends TestCase
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

    public function test_reordering_images_in_admin_changes_the_primary_image(): void
    {
        $this->actingAs(User::factory()->create(['is_active' => true]));

        $product = Product::factory()->create();

        foreach (['a', 'b', 'c'] as $name) {
            $product->addMedia(UploadedFile::fake()->image("{$name}.jpg"))->toMediaCollection('images');
        }

        $media = $product->fresh()->getMedia('images');
        $this->assertSame(['a', 'b', 'c'], $media->pluck('name')->all());

        $component = Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()]);

        // Admin form lists images in saved order (first = primary).
        $this->assertSame($media->pluck('uuid')->all(), array_values($component->get('data.images')));

        // Move the last image to the top, then save.
        $component
            ->call('reorderFormUploadedFiles', 'data.images', [$media[2]->uuid, $media[0]->uuid, $media[1]->uuid])
            ->call('save')
            ->assertHasNoFormErrors();

        $product = $product->fresh();

        $this->assertSame(['c', 'a', 'b'], $product->getMedia('images')->pluck('name')->all());
        $this->assertSame($product->getFirstMedia('images')->getUrl('card'), $product->primary_image_url);
    }
}
