<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'Order items';

    public function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('product_name')
            ->columns([
                Tables\Columns\ImageColumn::make('image'),
                Tables\Columns\TextColumn::make('product_name')->label('Product'),
                Tables\Columns\TextColumn::make('variant_title')->label('Variant'),
                Tables\Columns\TextColumn::make('sku'),
                Tables\Columns\TextColumn::make('quantity'),
                Tables\Columns\TextColumn::make('unit_price')
                    ->formatStateUsing(fn ($state, $record) => $record->order->currency_code.' '.number_format($state, 2)),
                Tables\Columns\TextColumn::make('total_price')
                    ->formatStateUsing(fn ($state, $record) => $record->order->currency_code.' '.number_format($state, 2)),
            ])
            ->headerActions([])
            ->actions([])
            ->bulkActions([]);
    }
}
