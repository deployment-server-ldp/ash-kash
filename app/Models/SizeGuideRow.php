<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SizeGuideRow extends Model
{
    use HasFactory;

    protected $fillable = ['size_guide_id', 'size_name', 'measurements', 'position'];

    protected $casts = [
        'measurements' => 'array',
    ];

    public function sizeGuide()
    {
        return $this->belongsTo(SizeGuide::class);
    }
}
