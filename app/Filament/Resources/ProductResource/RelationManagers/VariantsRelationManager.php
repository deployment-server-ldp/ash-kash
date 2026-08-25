<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Models\InventoryLog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $title = 'Variants (Size / Color / Stock)';

    public static function canViewForRecord($ownerRecord, string $pageClass): bool
    {
        return true;
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('sku')
                ->label('Variant SKU')
                ->required()
                ->unique(ignoreRecord: true)
                ->maxLength(255),
            Forms\Components\TextInput::make('title')
                ->label('Combination (e.g. "Black / Medium")')
                ->required()
                ->maxLength(255),
            Forms\Components\TextInput::make('price')
                ->numeric()
                ->prefix(fn () => currency()->baseCurrencyCode())
                ->helperText('Leave empty to use the product price.'),
            Forms\Components\TextInput::make('compare_at_price')
                ->numeric()
                ->prefix(fn () => currency()->baseCurrencyCode()),
            Forms\Components\TextInput::make('inventory_quantity')
                ->label('Stock quantity')
                ->numeric()
                ->required()
                ->default(0),
            Forms\Components\TextInput::make('weight')->numeric()->suffix('kg'),
            Forms\Components\FileUpload::make('image')
                ->image()
                ->directory('variants')
                ->imageEditor(),
            Forms\Components\TextInput::make('position')->numeric()->default(0),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->columns([
                Tables\Columns\ImageColumn::make('image'),
                Tables\Columns\TextColumn::make('title')->label('Variant')->searchable(),
                Tables\Columns\TextColumn::make('sku')->label('SKU')->searchable(),
                Tables\Columns\TextColumn::make('price')
                    ->formatStateUsing(fn ($state, $record) => money($record->effective_price)),
                Tables\Columns\TextColumn::make('inventory_quantity')
                    ->label('Stock')
                    ->badge()
                    ->color(fn ($state) => $state <= 0 ? 'danger' : ($state <= 5 ? 'warning' : 'success')),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->after(function ($record) {
                        InventoryLog::create([
                            'product_id' => $this->getOwnerRecord()->id,
                            'product_variant_id' => $record->id,
                            'user_id' => Auth::id(),
                            'type' => 'set',
                            'quantity_change' => $record->inventory_quantity,
                            'quantity_after' => $record->inventory_quantity,
                            'note' => 'Variant created',
                        ]);
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->after(function ($record) {
                        InventoryLog::create([
                            'product_id' => $this->getOwnerRecord()->id,
                            'product_variant_id' => $record->id,
                            'user_id' => Auth::id(),
                            'type' => 'set',
                            'quantity_change' => 0,
                            'quantity_after' => $record->inventory_quantity,
                            'note' => 'Adjusted from admin',
                        ]);
                    }),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->reorderable('position');
    }
}
