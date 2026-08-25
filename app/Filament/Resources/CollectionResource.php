<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CollectionResource\Pages;
use App\Models\Collection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CollectionResource extends Resource
{
    protected static ?string $model = Collection::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-group';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()->columnSpan(2)->schema([
                Forms\Components\Section::make()->schema([
                    Forms\Components\TextInput::make('name')
                        ->required()
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Forms\Set $set, ?string $state) => $set('slug', Str::slug($state)))
                        ->maxLength(255),
                    Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                    Forms\Components\Textarea::make('description')->rows(3)->columnSpanFull(),
                    Forms\Components\FileUpload::make('image')->image()->directory('collections')->imageEditor(),
                    Forms\Components\Select::make('type')
                        ->options(['manual' => 'Manual (pick products)', 'automatic' => 'Automatic (rule based)'])
                        ->default('manual')
                        ->live()
                        ->required(),
                    Forms\Components\Select::make('products')
                        ->relationship('products', 'name')
                        ->multiple()
                        ->searchable()
                        ->preload()
                        ->visible(fn (Forms\Get $get) => $get('type') === 'manual')
                        ->columnSpanFull(),
                    Forms\Components\KeyValue::make('rules')
                        ->keyLabel('Field (e.g. category, is_sale)')
                        ->valueLabel('Value')
                        ->visible(fn (Forms\Get $get) => $get('type') === 'automatic')
                        ->columnSpanFull(),
                ])->columns(2),
                Forms\Components\Section::make('SEO')->schema([
                    Forms\Components\TextInput::make('seo_title')->maxLength(255),
                    Forms\Components\Textarea::make('seo_description')->rows(2)->maxLength(500),
                ]),
            ]),
            Forms\Components\Group::make()->columnSpan(1)->schema([
                Forms\Components\Section::make('Status')->schema([
                    Forms\Components\Toggle::make('is_active')->default(true),
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                ]),
            ]),
        ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')->label(''),
                Tables\Columns\TextColumn::make('name')->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\TextColumn::make('products_count')->counts('products')->label('Products'),
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
            'index' => Pages\ListCollections::route('/'),
            'create' => Pages\CreateCollection::route('/create'),
            'edit' => Pages\EditCollection::route('/{record}/edit'),
        ];
    }
}
