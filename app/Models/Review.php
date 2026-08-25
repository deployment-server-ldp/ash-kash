<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 'customer_id', 'name', 'email', 'rating', 'title',
        'body', 'images', 'status', 'is_featured', 'ip_address',
    ];

    protected $casts = [
        'images' => 'array',
        'is_featured' => 'boolean',
        'rating' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
