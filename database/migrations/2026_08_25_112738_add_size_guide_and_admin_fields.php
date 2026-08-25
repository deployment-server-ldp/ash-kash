<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('size_guide_id')->nullable()->after('parent_id')
                ->constrained('size_guides')->nullOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('size_guide_id')->nullable()->after('brand_id')
                ->constrained('size_guides')->nullOnDelete();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('password');
            $table->string('avatar')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('size_guide_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('size_guide_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'avatar']);
        });
    }
};
