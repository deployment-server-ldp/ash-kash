<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentOrders extends BaseWidget
{
    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Recent orders';

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query()->latest())
            ->paginated(false)
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->weight('bold'),
                Tables\Columns\TextColumn::make('customer_name'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('grand_total')
                    ->formatStateUsing(fn ($state, $record) => $record->currency_code.' '.number_format($state, 2)),
                Tables\Columns\TextColumn::make('created_at')->since(),
            ])
            ->actions([
                Tables\Actions\Action::make('view')
                    ->url(fn (Order $record) => route('filament.admin.resources.orders.edit', $record)),
            ]);
    }
}
