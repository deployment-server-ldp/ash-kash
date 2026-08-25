<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('tag')->nullable();
            $table->string('desktop_image');
            $table->string('mobile_image')->nullable();
            $table->string('button_text')->nullable();
            $table->string('button_url')->nullable();
            $table->enum('text_align', ['left', 'center', 'right'])->default('left');
            $table->unsignedTinyInteger('overlay_opacity')->default(20);
            $table->unsignedInteger('duration_ms')->default(6000);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sliders');
    }
};
