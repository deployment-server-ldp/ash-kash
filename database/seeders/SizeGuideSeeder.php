<?php

namespace Database\Seeders;

use App\Models\SizeGuide;
use Illuminate\Database\Seeder;

class SizeGuideSeeder extends Seeder
{
    public function run(): void
    {
        $guide = SizeGuide::updateOrCreate(
            ['title' => 'Women\'s Apparel Size Guide'],
            ['instructions' => 'Measurements are in inches. For the best fit, measure yourself and compare to the chart below.', 'unit' => 'in']
        );

        $rows = [
            ['size_name' => 'XS', 'measurements' => ['Bust' => '32', 'Waist' => '25', 'Hip' => '35']],
            ['size_name' => 'S', 'measurements' => ['Bust' => '34', 'Waist' => '27', 'Hip' => '37']],
            ['size_name' => 'M', 'measurements' => ['Bust' => '36', 'Waist' => '29', 'Hip' => '39']],
            ['size_name' => 'L', 'measurements' => ['Bust' => '38', 'Waist' => '31', 'Hip' => '41']],
            ['size_name' => 'XL', 'measurements' => ['Bust' => '40', 'Waist' => '33', 'Hip' => '43']],
        ];

        foreach ($rows as $i => $row) {
            $guide->rows()->updateOrCreate(
                ['size_name' => $row['size_name']],
                ['measurements' => $row['measurements'], 'position' => $i]
            );
        }
    }
}
