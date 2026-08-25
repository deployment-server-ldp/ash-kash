<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'symbol', 'exchange_rate', 'decimal_places',
        'symbol_position', 'thousands_separator', 'decimal_separator',
        'is_default', 'is_active',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:6',
        'decimal_places' => 'integer',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function countries()
    {
        return $this->hasMany(Country::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
