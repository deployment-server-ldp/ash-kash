<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['name' => 'Ayesha Khan', 'email' => 'ayesha@example.com', 'phone' => '+923001234567'],
            ['name' => 'Sara Ahmed', 'email' => 'sara@example.com', 'phone' => '+923007654321'],
            ['name' => 'Fatima Malik', 'email' => 'fatima@example.com', 'phone' => '+923009988776'],
        ];

        foreach ($customers as $data) {
            $customer = Customer::updateOrCreate(
                ['email' => $data['email']],
                $data + ['password' => 'password', 'is_active' => true, 'email_verified_at' => now()]
            );

            $customer->addresses()->updateOrCreate(
                ['label' => 'Home'],
                [
                    'full_name' => $data['name'],
                    'phone' => $data['phone'],
                    'country_code' => 'PK',
                    'state' => 'Sindh',
                    'city' => 'Karachi',
                    'address_line1' => '123 Boutique Street',
                    'postal_code' => '74200',
                    'is_default' => true,
                ]
            );
        }
    }
}
