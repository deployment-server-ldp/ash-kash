<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'sku', 'title', 'price', 'compare_at_price',
        'inventory_quantity', 'weight', 'image', 'position', 'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function optionValues()
    {
        return $this->belongsToMany(ProductOptionValue::class, 'product_variant_option_values');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function getEffectivePriceAttribute(): float
    {
        return (float) ($this->price ?? $this->product->price);
    }

    public function getEffectiveCompareAtPriceAttribute(): ?float
    {
        $value = $this->compare_at_price ?? $this->product->compare_at_price;

        return $value ? (float) $value : null;
    }

    public function getIsInStockAttribute(): bool
    {
        if (! $this->product?->track_inventory) {
            return true;
        }

        return $this->inventory_quantity > 0;
    }

    public function getDisplayTitleAttribute(): string
    {
        if ($this->title) {
            return $this->title;
        }

        return $this->optionValues->pluck('value')->implode(' / ');
    }
}
