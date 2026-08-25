<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, SoftDeletes;

    protected $fillable = [
        'category_id', 'brand_id', 'size_guide_id', 'name', 'slug', 'sku',
        'description', 'short_description', 'video_url',
        'price', 'compare_at_price', 'cost_price', 'tax_rate',
        'track_inventory', 'inventory_quantity', 'low_stock_threshold',
        'weight', 'length', 'width', 'height',
        'status', 'is_featured', 'is_best_seller', 'is_new_arrival', 'is_sale', 'badge',
        'rating_avg', 'reviews_count',
        'seo_title', 'seo_description', 'seo_keywords', 'published_at', 'is_demo',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'track_inventory' => 'boolean',
        'is_featured' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_new_arrival' => 'boolean',
        'is_sale' => 'boolean',
        'is_demo' => 'boolean',
        'rating_avg' => 'decimal:2',
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            if (blank($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->useFallbackUrl('/images/placeholder-product.svg');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')->width(400)->height(500)->sharpen(5)->nonQueued();
        $this->addMediaConversion('card')->width(700)->height(875)->sharpen(5)->nonQueued();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function sizeGuide()
    {
        return $this->belongsTo(SizeGuide::class);
    }

    public function options()
    {
        return $this->hasMany(ProductOption::class)->orderBy('position');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class)->orderBy('position');
    }

    public function activeVariants()
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true)->orderBy('position');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'product_tag');
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'collection_product')->withPivot('sort_order');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews()
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function wishlistedBy()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeBestSeller($query)
    {
        return $query->where('is_best_seller', true);
    }

    public function scopeNewArrival($query)
    {
        return $query->where('is_new_arrival', true);
    }

    public function scopeOnSale($query)
    {
        return $query->where('is_sale', true);
    }

    public function getHasVariantsAttribute(): bool
    {
        return $this->options()->exists();
    }

    public function getTotalInventoryAttribute(): int
    {
        if ($this->has_variants) {
            return (int) $this->variants()->sum('inventory_quantity');
        }

        return (int) $this->inventory_quantity;
    }

    public function getIsInStockAttribute(): bool
    {
        if (! $this->track_inventory) {
            return true;
        }

        return $this->total_inventory > 0;
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->track_inventory && $this->total_inventory > 0 && $this->total_inventory <= $this->low_stock_threshold;
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->compare_at_price && $this->compare_at_price > $this->price) {
            return (int) round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100);
        }

        return null;
    }

    public function getPrimaryImageUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('images', 'card') ?: $this->getFirstMediaUrl('images');
    }

    public function getHoverImageUrlAttribute(): ?string
    {
        $media = $this->getMedia('images');

        return $media->count() > 1 ? $media[1]->getUrl('card') : null;
    }
}
