<?php

namespace App\Filament\Widgets;

use App\Models\OrderItem;
use App\Models\Product;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class BestSellingProducts extends BaseWidget
{
    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 1;

    protected static ?string $heading = 'Best selling products';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Product::query()
                    ->orderByDesc(
                        OrderItem::selectRaw('COALESCE(SUM(quantity),0)')
                            ->whereColumn('product_id', 'products.id')
                    )
                    ->limit(5)
            )
            ->paginated(false)
            ->columns([
                Tables\Columns\TextColumn::make('name')->weight('bold'),
                Tables\Columns\TextColumn::make('price')->formatStateUsing(fn ($state) => money($state)),
                Tables\Columns\TextColumn::make('total_inventory')->label('Stock'),
            ]);
    }
}
