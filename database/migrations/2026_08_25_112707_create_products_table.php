<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->longText('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->string('video_url')->nullable();

            // Base price is always stored/entered in the store's base currency.
            $table->decimal('price', 12, 2);
            $table->decimal('compare_at_price', 12, 2)->nullable();
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->decimal('tax_rate', 5, 2)->default(0);

            $table->boolean('track_inventory')->default(true);
            $table->integer('inventory_quantity')->default(0);
            $table->unsignedInteger('low_stock_threshold')->default(5);

            $table->decimal('weight', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();

            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_best_seller')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_sale')->default(false);
            $table->string('badge')->nullable();

            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);

            $table->string('seo_title')->nullable();
            $table->string('seo_description', 500)->nullable();
            $table->string('seo_keywords')->nullable();

            $table->timestamp('published_at')->nullable();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->index(['is_featured', 'is_best_seller', 'is_new_arrival', 'is_sale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
