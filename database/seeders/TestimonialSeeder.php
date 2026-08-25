<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            ['name' => 'Ayesha K.', 'rating' => 5, 'content' => 'The quality is beyond anything I expected — and Cash on Delivery made it so easy to order.'],
            ['name' => 'Sara A.', 'rating' => 5, 'content' => 'My go-to boutique for occasion wear. Fast delivery and stunning packaging.'],
            ['name' => 'Fatima M.', 'rating' => 4, 'content' => 'Beautiful fabrics and true-to-size fit. Will definitely be ordering again.'],
        ];

        foreach ($testimonials as $i => $data) {
            Testimonial::updateOrCreate(
                ['name' => $data['name']],
                $data + ['sort_order' => $i, 'is_active' => true]
            );
        }
    }
}
