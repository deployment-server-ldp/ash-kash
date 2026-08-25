<?php

namespace App\Livewire;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\CartService;
use Livewire\Component;

class ProductAddToCart extends Component
{
    public Product $product;

    public array $selectedOptions = [];

    public int $quantity = 1;

    public ?string $error = null;

    public function mount(Product $product): void
    {
        $this->product = $product;
    }

    public function selectOption(string $optionName, string $value): void
    {
        $this->selectedOptions[$optionName] = $value;
        $this->error = null;
    }

    public function getSelectedVariantProperty(): ?ProductVariant
    {
        if (! $this->product->has_variants) {
            return null;
        }

        $options = $this->product->options;

        if (count($this->selectedOptions) < $options->count()) {
            return null;
        }

        foreach ($this->product->variants as $variant) {
            $values = $variant->optionValues->pluck('value', 'option.name')->toArray();
            // Fallback: map via product_option_id -> name
            $variantMap = [];
            foreach ($variant->optionValues as $ov) {
                $variantMap[$ov->option->name] = $ov->value;
            }

            if ($variantMap == $this->selectedOptions) {
                return $variant;
            }
        }

        return null;
    }

    public function addToCart(): void
    {
        $this->error = null;

        if ($this->product->has_variants && ! $this->selectedVariant) {
            $this->error = 'Please select '.$this->product->options->pluck('name')->implode(' & ').'.';

            return;
        }

        try {
            app(CartService::class)->addItem($this->product, $this->quantity, $this->selectedVariant);
            $this->dispatch('cart-updated');
            $this->dispatch('open-cart-drawer');
        } catch (\RuntimeException $e) {
            $this->error = $e->getMessage();
        }
    }

    public function render()
    {
        return view('livewire.product-add-to-cart');
    }
}
