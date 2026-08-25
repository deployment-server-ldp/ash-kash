<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipping_zone_id', 'name', 'price', 'free_shipping_threshold',
        'estimated_days_min', 'estimated_days_max', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'free_shipping_threshold' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function zone()
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }

    public function costFor(float $subtotal): float
    {
        if ($this->free_shipping_threshold !== null && $subtotal >= (float) $this->free_shipping_threshold) {
            return 0.0;
        }

        return (float) $this->price;
    }

    public function getEstimatedDeliveryAttribute(): string
    {
        return $this->estimated_days_min === $this->estimated_days_max
            ? "{$this->estimated_days_min} days"
            : "{$this->estimated_days_min}-{$this->estimated_days_max} days";
    }
}
