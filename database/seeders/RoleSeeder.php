<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $resources = ['products', 'orders', 'customers', 'coupons', 'shipping', 'content', 'blog', 'settings', 'users'];
        $actions = ['view', 'create', 'edit', 'delete', 'publish'];

        foreach ($resources as $resource) {
            foreach ($actions as $action) {
                Permission::findOrCreate("{$action} {$resource}");
            }
        }

        $superAdmin = Role::findOrCreate('Super Admin');
        // Super Admin bypasses checks entirely via Gate::before in AppServiceProvider.

        $manager = Role::findOrCreate('Manager');
        $manager->syncPermissions(Permission::all());

        $productManager = Role::findOrCreate('Product Manager');
        $productManager->syncPermissions(Permission::where('name', 'like', '%products')->get());

        $orderManager = Role::findOrCreate('Order Manager');
        $orderManager->syncPermissions(Permission::whereIn('name', [
            'view orders', 'edit orders', 'view customers', 'view shipping',
        ])->get());

        $contentManager = Role::findOrCreate('Content Manager');
        $contentManager->syncPermissions(Permission::where('name', 'like', '%content')->orWhere('name', 'like', '%blog')->get());

        $admin = User::firstOrCreate(
            ['email' => 'admin@ashkash.test'],
            ['name' => 'Store Admin', 'password' => 'password', 'is_active' => true]
        );
        $admin->assignRole($superAdmin);
    }
}
