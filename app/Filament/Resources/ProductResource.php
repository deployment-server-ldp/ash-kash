<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use App\Models\SizeGuide;
use Filament\Forms;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()
                ->columnSpan(2)
                ->schema([
                    Forms\Components\Tabs::make('Product')
                        ->columnSpanFull()
                        ->tabs([
                            Forms\Components\Tabs\Tab::make('General')
                                ->schema([
                                    Forms\Components\TextInput::make('name')
                                        ->required()
                                        ->live(onBlur: true)
                                        ->afterStateUpdated(fn (Forms\Set $set, ?string $state) => $set('slug', Str::slug($state)))
                                        ->maxLength(255),
                                    Forms\Components\TextInput::make('slug')
                                        ->required()
                                        ->unique(ignoreRecord: true)
                                        ->maxLength(255),
                                    Forms\Components\TextInput::make('sku')
                                        ->label('SKU')
                                        ->required()
                                        ->unique(ignoreRecord: true)
                                        ->maxLength(255),
                                    Forms\Components\Textarea::make('short_description')
                                        ->rows(2)
                                        ->maxLength(500)
                                        ->columnSpanFull(),
                                    Forms\Components\RichEditor::make('description')
                                        ->columnSpanFull(),
                                    Forms\Components\TextInput::make('video_url')
                                        ->label('Product video URL')
                                        ->url()
                                        ->maxLength(255),
                                    Forms\Components\Select::make('category_id')
                                        ->relationship('category', 'name')
                                        ->searchable()
                                        ->preload(),
                                    Forms\Components\Select::make('brand_id')
                                        ->label('Brand')
                                        ->relationship('brand', 'name')
                                        ->searchable()
                                        ->preload()
                                        ->createOptionForm([
                                            Forms\Components\TextInput::make('name')->required(),
                                        ]),
                                    Forms\Components\Select::make('collections')
                                        ->relationship('collections', 'name')
                                        ->multiple()
                                        ->searchable()
                                        ->preload(),
                                    Forms\Components\Select::make('tags')
                                        ->relationship('tags', 'name')
                                        ->multiple()
                                        ->searchable()
                                        ->preload()
                                        ->createOptionForm([
                                            Forms\Components\TextInput::make('name')->required(),
                                        ]),
                                    Forms\Components\Select::make('size_guide_id')
                                        ->label('Size guide')
                                        ->options(fn () => SizeGuide::query()->pluck('title', 'id'))
                                        ->searchable(),
                                ])->columns(2),

                            Forms\Components\Tabs\Tab::make('Pricing & Inventory')
                                ->schema([
                                    Forms\Components\TextInput::make('price')
                                        ->required()
                                        ->numeric()
                                        ->prefix(fn () => currency()->baseCurrencyCode())
                                        ->helperText('Base price, stored in the store base currency.'),
                                    Forms\Components\TextInput::make('compare_at_price')
                                        ->numeric()
                                        ->prefix(fn () => currency()->baseCurrencyCode())
                                        ->helperText('Set higher than price to show a strike-through / sale badge.'),
                                    Forms\Components\TextInput::make('cost_price')
                                        ->numeric()
                                        ->prefix(fn () => currency()->baseCurrencyCode()),
                                    Forms\Components\TextInput::make('tax_rate')
                                        ->numeric()
                                        ->suffix('%')
                                        ->default(0),
                                    Forms\Components\Toggle::make('track_inventory')
                                        ->default(true)
                                        ->live(),
                                    Forms\Components\TextInput::make('inventory_quantity')
                                        ->numeric()
                                        ->default(0)
                                        ->visible(fn (Forms\Get $get) => $get('track_inventory'))
                                        ->helperText('Ignored once this product has variants — each variant tracks its own stock.'),
                                    Forms\Components\TextInput::make('low_stock_threshold')
                                        ->numeric()
                                        ->default(5),
                                    Forms\Components\TextInput::make('weight')
                                        ->numeric()
                                        ->suffix('kg'),
                                    Forms\Components\TextInput::make('length')->numeric()->suffix('cm'),
                                    Forms\Components\TextInput::make('width')->numeric()->suffix('cm'),
                                    Forms\Components\TextInput::make('height')->numeric()->suffix('cm'),
                                ])->columns(3),

                            Forms\Components\Tabs\Tab::make('Images')
                                ->schema([
                                    SpatieMediaLibraryFileUpload::make('images')
                                        ->collection('images')
                                        ->multiple()
                                        ->reorderable()
                                        ->image()
                                        ->imageEditor()
                                        ->panelLayout('grid')
                                        ->helperText('First image is the primary card image; second becomes the hover image.')
                                        ->columnSpanFull(),
                                ]),

                            Forms\Components\Tabs\Tab::make('Options & Variants')
                                ->schema([
                                    Forms\Components\Repeater::make('options')
                                        ->relationship()
                                        ->label('Options (e.g. Size, Color)')
                                        ->schema([
                                            Forms\Components\TextInput::make('name')
                                                ->required()
                                                ->placeholder('Size / Color'),
                                            Forms\Components\Repeater::make('values')
                                                ->relationship()
                                                ->schema([
                                                    Forms\Components\TextInput::make('value')->required(),
                                                    Forms\Components\ColorPicker::make('hex_value')->label('Swatch color'),
                                                ])
                                                ->columns(2)
                                                ->defaultItems(1)
                                                ->addActionLabel('Add value'),
                                        ])
                                        ->addActionLabel('Add option')
                                        ->collapsible()
                                        ->columnSpanFull(),
                                ]),

                            Forms\Components\Tabs\Tab::make('SEO')
                                ->schema([
                                    Forms\Components\TextInput::make('seo_title')->maxLength(255),
                                    Forms\Components\Textarea::make('seo_description')->rows(2)->maxLength(500),
                                    Forms\Components\TextInput::make('seo_keywords')->maxLength(255),
                                ]),
                        ]),
                ]),

            Forms\Components\Group::make()
                ->columnSpan(1)
                ->schema([
                    Forms\Components\Section::make('Status')
                        ->schema([
                            Forms\Components\Select::make('status')
                                ->options([
                                    'draft' => 'Draft',
                                    'active' => 'Active',
                                    'archived' => 'Archived',
                                ])
                                ->default('draft')
                                ->required(),
                            Forms\Components\DateTimePicker::make('published_at'),
                        ]),
                    Forms\Components\Section::make('Merchandising')
                        ->schema([
                            Forms\Components\Toggle::make('is_featured')->label('Featured product'),
                            Forms\Components\Toggle::make('is_best_seller')->label('Best seller'),
                            Forms\Components\Toggle::make('is_new_arrival')->label('New arrival'),
                            Forms\Components\Toggle::make('is_sale')->label('On sale'),
                            Forms\Components\TextInput::make('badge')
                                ->helperText('Custom badge text, e.g. LIMITED, TRENDING')
                                ->maxLength(255),
                        ]),
                ]),
        ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\SpatieMediaLibraryImageColumn::make('images')
                    ->collection('images')
                    ->conversion('thumb')
                    ->label(''),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->weight('bold')
                    ->description(fn (Product $record): string => $record->sku),
                Tables\Columns\TextColumn::make('category.name')->label('Category')->toggleable(),
                Tables\Columns\TextColumn::make('price')
                    ->formatStateUsing(fn ($state) => money($state))
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_inventory')
                    ->label('Stock')
                    ->badge()
                    ->color(fn (Product $record) => match (true) {
                        ! $record->track_inventory => 'gray',
                        $record->total_inventory <= 0 => 'danger',
                        $record->is_low_stock => 'warning',
                        default => 'success',
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'active' => 'success',
                        'draft' => 'gray',
                        'archived' => 'danger',
                    }),
                Tables\Columns\IconColumn::make('is_featured')->boolean()->toggleable(),
                Tables\Columns\IconColumn::make('is_sale')->boolean()->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'active' => 'Active', 'archived' => 'Archived']),
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name'),
                Tables\Filters\TernaryFilter::make('is_featured'),
                Tables\Filters\TernaryFilter::make('is_sale'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            RelationManagers\VariantsRelationManager::class,
            RelationManagers\ReviewsRelationManager::class,
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->withoutGlobalScopes([
            SoftDeletingScope::class,
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
