<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class SalesChart extends ChartWidget
{
    protected static ?string $heading = 'Revenue trend (last 30 days)';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 2;

    protected function getData(): array
    {
        $days = collect(range(29, 0))->map(fn ($i) => Carbon::today()->subDays($i));

        $totals = Order::query()
            ->whereNotIn('status', ['cancelled', 'returned', 'refunded'])
            ->where('created_at', '>=', Carbon::today()->subDays(29))
            ->selectRaw('DATE(created_at) as day, SUM(grand_total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        return [
            'datasets' => [
                [
                    'label' => 'Revenue',
                    'data' => $days->map(fn ($d) => (float) ($totals[$d->toDateString()] ?? 0))->all(),
                    'borderColor' => '#a8834f',
                    'backgroundColor' => 'rgba(168, 131, 79, 0.15)',
                    'fill' => true,
                    'tension' => 0.35,
                ],
            ],
            'labels' => $days->map(fn ($d) => $d->format('M j'))->all(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
