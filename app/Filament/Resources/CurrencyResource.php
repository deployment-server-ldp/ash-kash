<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CurrencyResource\Pages;
use App\Models\Currency;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CurrencyResource extends Resource
{
    protected static ?string $model = Currency::class;

    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';

    protected static ?string $navigationGroup = 'Store settings';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required(),
            Forms\Components\TextInput::make('code')
                ->required()
                ->length(3)
                ->unique(ignoreRecord: true)
                ->formatStateUsing(fn ($state) => $state ? strtoupper($state) : $state)
                ->dehydrateStateUsing(fn ($state) => strtoupper($state)),
            Forms\Components\TextInput::make('symbol')->required(),
            Forms\Components\TextInput::make('exchange_rate')
                ->numeric()
                ->required()
                ->default(1)
                ->helperText('How many units of this currency equal 1 unit of the base currency ('.config('shop.base_currency').').'),
            Forms\Components\TextInput::make('decimal_places')->numeric()->default(2),
            Forms\Components\Select::make('symbol_position')
                ->options(['before' => 'Before amount (e.g. $100)', 'after' => 'After amount (e.g. 100 kr)'])
                ->default('before'),
            Forms\Components\TextInput::make('thousands_separator')->default(','),
            Forms\Components\TextInput::make('decimal_separator')->default('.'),
            Forms\Components\Toggle::make('is_default')->label('Default currency'),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')->weight('bold'),
                Tables\Columns\TextColumn::make('name'),
                Tables\Columns\TextColumn::make('symbol'),
                Tables\Columns\TextColumn::make('exchange_rate'),
                Tables\Columns\IconColumn::make('is_default')->boolean(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCurrencies::route('/'),
            'create' => Pages\CreateCurrency::route('/create'),
            'edit' => Pages\EditCurrency::route('/{record}/edit'),
        ];
    }
}
