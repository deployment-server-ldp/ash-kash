<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SizeGuide extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'instructions', 'unit', 'image'];

    public function rows()
    {
        return $this->hasMany(SizeGuideRow::class)->orderBy('position');
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
