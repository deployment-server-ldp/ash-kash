<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = ['customer_id', 'session_id', 'currency_code', 'coupon_code'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class, 'coupon_code', 'code');
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->items->sum(fn (CartItem $item) => $item->price_snapshot * $item->quantity);
    }

    public function getItemsCountAttribute(): int
    {
        return (int) $this->items->sum('quantity');
    }
}
