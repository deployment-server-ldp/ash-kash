<?php

namespace App\Filament\Resources\CustomerResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class AddressesRelationManager extends RelationManager
{
    protected static string $relationship = 'addresses';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('label')->default('Home'),
            Forms\Components\TextInput::make('full_name')->required(),
            Forms\Components\TextInput::make('phone')->required(),
            Forms\Components\TextInput::make('country_code')->required()->maxLength(2),
            Forms\Components\TextInput::make('state'),
            Forms\Components\TextInput::make('city')->required(),
            Forms\Components\TextInput::make('address_line1')->required()->columnSpanFull(),
            Forms\Components\TextInput::make('address_line2')->columnSpanFull(),
            Forms\Components\TextInput::make('postal_code'),
            Forms\Components\Toggle::make('is_default'),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('full_name')
            ->columns([
                Tables\Columns\TextColumn::make('label'),
                Tables\Columns\TextColumn::make('full_name'),
                Tables\Columns\TextColumn::make('city'),
                Tables\Columns\TextColumn::make('country_code'),
                Tables\Columns\IconColumn::make('is_default')->boolean(),
            ])
            ->headerActions([Tables\Actions\CreateAction::make()])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }
}
