<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('size_guide_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('size_guide_id')->constrained()->cascadeOnDelete();
            $table->string('size_name');
            $table->json('measurements'); // e.g. {"Bust": "34", "Waist": "28", "Hip": "36"}
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('size_guide_rows');
    }
};
