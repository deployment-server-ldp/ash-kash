<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?int $navigationSort = 0;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'pending')->count() ?: null;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()->columnSpan(2)->schema([
                Forms\Components\Section::make('Order')->schema([
                    Forms\Components\TextInput::make('order_number')->disabled()->dehydrated(false),
                    Forms\Components\Select::make('status')
                        ->options(collect(Order::STATUSES)->mapWithKeys(fn ($s) => [$s => ucwords(str_replace('_', ' ', $s))]))
                        ->required()
                        ->live(),
                    Forms\Components\Select::make('payment_status')
                        ->options(['pending' => 'Pending', 'paid' => 'Paid', 'refunded' => 'Refunded'])
                        ->required(),
                    Forms\Components\TextInput::make('tracking_number'),
                    Forms\Components\TextInput::make('tracking_url')->url(),
                    Forms\Components\Textarea::make('internal_notes')
                        ->label('Internal notes (not visible to customer)')
                        ->rows(3)
                        ->columnSpanFull(),
                ])->columns(2),

                Forms\Components\Section::make('Customer & Shipping')->schema([
                    Forms\Components\TextInput::make('customer_name')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('email')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('phone')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('shipping_method_name')->disabled()->dehydrated(false),
                    Forms\Components\Textarea::make('notes')
                        ->label('Customer order notes')
                        ->disabled()
                        ->dehydrated(false)
                        ->columnSpanFull(),
                ])->columns(2),
            ]),

            Forms\Components\Group::make()->columnSpan(1)->schema([
                Forms\Components\Section::make('Totals')->schema([
                    Forms\Components\TextInput::make('subtotal')->disabled()->dehydrated(false)->prefix(fn ($record) => $record?->currency_code),
                    Forms\Components\TextInput::make('discount_total')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('shipping_total')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('tax_total')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('grand_total')->disabled()->dehydrated(false),
                    Forms\Components\TextInput::make('coupon_code')->disabled()->dehydrated(false),
                ]),
            ]),
        ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('order_number')->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('customer_name')->searchable(['customer_name', 'email', 'phone']),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'pending' => 'gray',
                        'confirmed', 'processing', 'packed' => 'info',
                        'shipped', 'out_for_delivery' => 'warning',
                        'delivered' => 'success',
                        'cancelled', 'returned', 'refunded' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state) => ucwords(str_replace('_', ' ', $state))),
                Tables\Columns\TextColumn::make('payment_status')->badge(),
                Tables\Columns\TextColumn::make('grand_total')
                    ->formatStateUsing(fn ($state, $record) => $record->currency_code.' '.number_format($state, 2))
                    ->sortable(),
                Tables\Columns\TextColumn::make('items_count')->counts('items')->label('Items'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(Order::STATUSES)->mapWithKeys(fn ($s) => [$s => ucwords(str_replace('_', ' ', $s))])),
                Tables\Filters\SelectFilter::make('payment_status')
                    ->options(['pending' => 'Pending', 'paid' => 'Paid', 'refunded' => 'Refunded']),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'], fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
                            ->when($data['until'], fn ($q, $date) => $q->whereDate('created_at', '<=', $date));
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->url(fn (Order $record) => route('admin.orders.invoice', $record)),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ItemsRelationManager::class,
            RelationManagers\StatusHistoriesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
