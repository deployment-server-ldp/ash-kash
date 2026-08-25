<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Collection extends Model
{
    use HasFactory;

    protected $table = 'collections';

    protected $fillable = [
        'name', 'slug', 'description', 'image', 'type', 'rules',
        'seo_title', 'seo_description', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'rules' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saving(function (Collection $collection) {
            if (blank($collection->slug)) {
                $collection->slug = Str::slug($collection->name);
            }
        });
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'collection_product')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
