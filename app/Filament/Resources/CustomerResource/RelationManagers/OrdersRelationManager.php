<?php

namespace App\Filament\Resources\CustomerResource\RelationManagers;

use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class OrdersRelationManager extends RelationManager
{
    protected static string $relationship = 'orders';

    public function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('order_number')
            ->columns([
                Tables\Columns\TextColumn::make('order_number'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('grand_total')
                    ->formatStateUsing(fn ($state, $record) => $record->currency_code.' '.number_format($state, 2)),
                Tables\Columns\TextColumn::make('created_at')->dateTime(),
            ])
            ->actions([Tables\Actions\ViewAction::make()->url(fn ($record) => route('filament.admin.resources.orders.edit', $record))])
            ->headerActions([]);
    }
}
