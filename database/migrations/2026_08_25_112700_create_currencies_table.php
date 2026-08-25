<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 3)->unique();
            $table->string('symbol', 8);
            $table->decimal('exchange_rate', 14, 6)->default(1);
            $table->unsignedTinyInteger('decimal_places')->default(2);
            $table->enum('symbol_position', ['before', 'after'])->default('before');
            $table->string('thousands_separator', 2)->default(',');
            $table->string('decimal_separator', 2)->default('.');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
