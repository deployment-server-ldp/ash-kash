<?php

namespace App\Filament\Resources\ShippingZoneResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class MethodsRelationManager extends RelationManager
{
    protected static string $relationship = 'methods';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required()->placeholder('Standard Delivery'),
            Forms\Components\TextInput::make('price')
                ->numeric()
                ->required()
                ->prefix(fn () => currency()->baseCurrencyCode()),
            Forms\Components\TextInput::make('free_shipping_threshold')
                ->numeric()
                ->prefix(fn () => currency()->baseCurrencyCode())
                ->helperText('Orders at or above this subtotal ship free.'),
            Forms\Components\TextInput::make('estimated_days_min')->numeric()->default(2),
            Forms\Components\TextInput::make('estimated_days_max')->numeric()->default(5),
            Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name'),
                Tables\Columns\TextColumn::make('price')
                    ->formatStateUsing(fn ($state) => currency()->baseCurrencyCode().' '.number_format($state, 2)),
                Tables\Columns\TextColumn::make('free_shipping_threshold')
                    ->formatStateUsing(fn ($state) => $state ? currency()->baseCurrencyCode().' '.number_format($state, 2) : '—'),
                Tables\Columns\TextColumn::make('estimated_delivery')->label('ETA'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->headerActions([Tables\Actions\CreateAction::make()])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->reorderable('sort_order');
    }
}
