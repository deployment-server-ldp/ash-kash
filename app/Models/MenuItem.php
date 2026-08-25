<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_id', 'parent_id', 'label', 'type', 'url',
        'category_id', 'collection_id', 'product_id', 'page_id',
        'sort_order', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function parent()
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->where('is_active', true)->orderBy('sort_order');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function getResolvedUrlAttribute(): string
    {
        return match ($this->type) {
            'category' => $this->category ? route('shop.category', $this->category->slug) : '#',
            'collection' => $this->collection ? route('shop.collection', $this->collection->slug) : '#',
            'product' => $this->product ? route('shop.product', $this->product->slug) : '#',
            'page' => $this->page ? route('pages.show', $this->page->slug) : '#',
            default => $this->url ?: '#',
        };
    }
}
