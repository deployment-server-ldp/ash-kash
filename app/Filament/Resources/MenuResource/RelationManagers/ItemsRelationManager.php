<?php

namespace App\Filament\Resources\MenuResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'allItems';

    protected static ?string $title = 'Menu items';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('label')->required(),
            Forms\Components\Select::make('type')
                ->options([
                    'custom' => 'Custom URL',
                    'category' => 'Category',
                    'collection' => 'Collection',
                    'product' => 'Product',
                    'page' => 'Page',
                ])
                ->default('custom')
                ->live()
                ->required(),
            Forms\Components\TextInput::make('url')
                ->label('URL')
                ->placeholder('/shop or https://...')
                ->visible(fn (Forms\Get $get) => $get('type') === 'custom'),
            Forms\Components\Select::make('category_id')
                ->relationship('category', 'name')
                ->searchable()
                ->visible(fn (Forms\Get $get) => $get('type') === 'category'),
            Forms\Components\Select::make('collection_id')
                ->relationship('collection', 'name')
                ->searchable()
                ->visible(fn (Forms\Get $get) => $get('type') === 'collection'),
            Forms\Components\Select::make('product_id')
                ->relationship('product', 'name')
                ->searchable()
                ->visible(fn (Forms\Get $get) => $get('type') === 'product'),
            Forms\Components\Select::make('page_id')
                ->relationship('page', 'title')
                ->searchable()
                ->visible(fn (Forms\Get $get) => $get('type') === 'page'),
            Forms\Components\Select::make('parent_id')
                ->label('Parent item (leave empty for top level)')
                ->relationship('parent', 'label', fn ($query) => $query->where('menu_id', $this->getOwnerRecord()->id))
                ->searchable(),
            Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('label')
            ->defaultSort('sort_order')
            ->columns([
                Tables\Columns\TextColumn::make('label'),
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\TextColumn::make('parent.label')->label('Parent')->placeholder('— top level —'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->headerActions([Tables\Actions\CreateAction::make()])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->reorderable('sort_order');
    }
}
