<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'countries', 'is_active', 'sort_order'];

    protected $casts = [
        'countries' => 'array',
        'is_active' => 'boolean',
    ];

    public function methods()
    {
        return $this->hasMany(ShippingMethod::class)->orderBy('sort_order');
    }

    public function activeMethods()
    {
        return $this->hasMany(ShippingMethod::class)->where('is_active', true)->orderBy('sort_order');
    }

    public static function forCountry(string $iso2): ?self
    {
        $zone = static::where('is_active', true)
            ->get()
            ->first(fn (self $zone) => in_array($iso2, $zone->countries ?? [], true));

        return $zone ?? static::where('is_active', true)
            ->get()
            ->first(fn (self $zone) => in_array('*', $zone->countries ?? [], true));
    }
}
