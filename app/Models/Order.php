<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUSES = [
        'pending', 'confirmed', 'processing', 'packed', 'shipped',
        'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
    ];

    protected $fillable = [
        'order_number', 'customer_id', 'coupon_id', 'coupon_code', 'status',
        'customer_name', 'email', 'phone',
        'currency_code', 'exchange_rate_snapshot',
        'subtotal', 'discount_total', 'shipping_total', 'tax_total', 'grand_total',
        'shipping_address', 'billing_address', 'shipping_method_name',
        'payment_method', 'payment_status',
        'notes', 'internal_notes', 'tracking_number', 'tracking_url',
        'ip_address', 'country_code', 'is_demo',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'exchange_rate_snapshot' => 'decimal:6',
        'subtotal' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'shipping_total' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'is_demo' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (blank($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber(): string
    {
        return 'AK-'.now()->format('ymd').'-'.strtoupper(Str::random(5));
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    public function scopeSearch($query, ?string $term)
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('order_number', 'like', "%{$term}%")
                ->orWhere('customer_name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%");
        });
    }
}
