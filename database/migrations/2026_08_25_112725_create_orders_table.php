<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->string('coupon_code')->nullable();

            $table->enum('status', [
                'pending', 'confirmed', 'processing', 'packed', 'shipped',
                'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
            ])->default('pending');

            $table->string('customer_name');
            $table->string('email')->nullable();
            $table->string('phone');

            // Amounts are stored in the store's base currency.
            $table->string('currency_code', 3)->default('PKR');
            $table->decimal('exchange_rate_snapshot', 14, 6)->default(1);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('shipping_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);

            $table->json('shipping_address');
            $table->json('billing_address')->nullable();
            $table->string('shipping_method_name')->nullable();

            $table->enum('payment_method', ['cod'])->default('cod');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');

            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();

            $table->string('ip_address', 45)->nullable();
            $table->string('country_code', 2)->nullable();
            $table->boolean('is_demo')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
