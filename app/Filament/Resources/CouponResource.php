<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CouponResource\Pages;
use App\Models\Coupon;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CouponResource extends Resource
{
    protected static ?string $model = Coupon::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';

    protected static ?string $navigationGroup = 'Marketing';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('code')
                ->required()
                ->unique(ignoreRecord: true)
                ->maxLength(255)
                ->formatStateUsing(fn ($state) => $state ? strtoupper($state) : $state)
                ->dehydrateStateUsing(fn ($state) => strtoupper($state)),
            Forms\Components\Select::make('type')
                ->options([
                    'percentage' => 'Percentage off',
                    'fixed' => 'Fixed amount off',
                    'free_shipping' => 'Free shipping',
                ])
                ->required()
                ->live(),
            Forms\Components\TextInput::make('amount')
                ->numeric()
                ->required()
                ->suffix(fn (Forms\Get $get) => $get('type') === 'percentage' ? '%' : currency()->baseCurrencyCode())
                ->visible(fn (Forms\Get $get) => $get('type') !== 'free_shipping'),
            Forms\Components\TextInput::make('min_order_amount')->numeric()->prefix(fn () => currency()->baseCurrencyCode()),
            Forms\Components\TextInput::make('max_discount_amount')->numeric()->prefix(fn () => currency()->baseCurrencyCode()),
            Forms\Components\Select::make('applies_to')
                ->options(['all' => 'All products', 'category' => 'Specific category', 'product' => 'Specific product'])
                ->default('all')
                ->live()
                ->required(),
            Forms\Components\Select::make('category_id')
                ->relationship('category', 'name')
                ->visible(fn (Forms\Get $get) => $get('applies_to') === 'category'),
            Forms\Components\Select::make('product_id')
                ->relationship('product', 'name')
                ->searchable()
                ->visible(fn (Forms\Get $get) => $get('applies_to') === 'product'),
            Forms\Components\Toggle::make('first_order_only'),
            Forms\Components\DateTimePicker::make('start_date'),
            Forms\Components\DateTimePicker::make('end_date'),
            Forms\Components\TextInput::make('usage_limit')->numeric()->label('Total usage limit'),
            Forms\Components\TextInput::make('usage_limit_per_customer')->numeric(),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')->searchable()->weight('bold')->copyable(),
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\TextColumn::make('amount'),
                Tables\Columns\TextColumn::make('used_count')->label('Used'),
                Tables\Columns\TextColumn::make('end_date')->dateTime()->label('Expires'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCoupons::route('/'),
            'create' => Pages\CreateCoupon::route('/create'),
            'edit' => Pages\EditCoupon::route('/{record}/edit'),
        ];
    }
}
