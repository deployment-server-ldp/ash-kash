<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->words(3, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 99999),
            'sku' => strtoupper($this->faker->bothify('SKU-####??')),
            'description' => $this->faker->paragraph(),
            'short_description' => $this->faker->sentence(),
            'price' => $this->faker->numberBetween(2000, 40000),
            'track_inventory' => true,
            'inventory_quantity' => $this->faker->numberBetween(0, 20),
            'low_stock_threshold' => 5,
            'status' => 'draft',
            'is_demo' => true,
        ];
    }
}
