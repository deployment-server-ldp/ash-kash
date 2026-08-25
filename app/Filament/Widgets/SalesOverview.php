<?php

namespace App\Filament\Widgets;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SalesOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $paidOrders = Order::query()->whereNotIn('status', ['cancelled', 'returned', 'refunded']);

        $totalSales = (clone $paidOrders)->sum('grand_total');
        $totalOrders = Order::query()->count();
        $pendingOrders = Order::query()->where('status', 'pending')->count();
        $deliveredOrders = Order::query()->where('status', 'delivered')->count();
        $totalCustomers = Customer::query()->count();
        $totalProducts = Product::query()->count();
        $lowStock = Product::query()
            ->where('track_inventory', true)
            ->whereColumn('inventory_quantity', '<=', 'low_stock_threshold')
            ->count();

        return [
            Stat::make('Total sales', money((float) $totalSales))
                ->description('All non-cancelled orders')
                ->color('success')
                ->icon('heroicon-o-banknotes'),
            Stat::make('Total orders', $totalOrders)
                ->icon('heroicon-o-shopping-bag'),
            Stat::make('Pending orders', $pendingOrders)
                ->color('warning')
                ->icon('heroicon-o-clock'),
            Stat::make('Delivered orders', $deliveredOrders)
                ->color('success')
                ->icon('heroicon-o-check-circle'),
            Stat::make('Total customers', $totalCustomers)
                ->icon('heroicon-o-users'),
            Stat::make('Total products', $totalProducts)
                ->icon('heroicon-o-rectangle-stack'),
            Stat::make('Low stock products', $lowStock)
                ->color($lowStock > 0 ? 'danger' : 'success')
                ->icon('heroicon-o-exclamation-triangle'),
        ];
    }
}
