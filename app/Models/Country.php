<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'iso2', 'phone_code', 'currency_id', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
