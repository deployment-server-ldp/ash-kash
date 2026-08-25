<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'type', 'amount', 'min_order_amount', 'max_discount_amount',
        'applies_to', 'category_id', 'product_id', 'first_order_only',
        'start_date', 'end_date', 'usage_limit', 'usage_limit_per_customer',
        'used_count', 'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'first_order_only' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function usages()
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isCurrentlyValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $subtotal, ?Product $productInCart = null): float
    {
        if ($this->min_order_amount && $subtotal < (float) $this->min_order_amount) {
            return 0.0;
        }

        $discount = match ($this->type) {
            'percentage' => $subtotal * ((float) $this->amount / 100),
            'fixed' => (float) $this->amount,
            'free_shipping' => 0.0,
            default => 0.0,
        };

        if ($this->max_discount_amount) {
            $discount = min($discount, (float) $this->max_discount_amount);
        }

        return min($discount, $subtotal);
    }
}
