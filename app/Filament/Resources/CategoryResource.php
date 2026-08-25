<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryResource\Pages;
use App\Models\Category;
use App\Models\SizeGuide;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()
                ->columnSpan(2)
                ->schema([
                    Forms\Components\Section::make('Category details')
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
                            Forms\Components\Textarea::make('description')
                                ->rows(3)
                                ->columnSpanFull(),
                            Forms\Components\Select::make('parent_id')
                                ->label('Parent category')
                                ->relationship('parent', 'name', ignoreRecord: true)
                                ->searchable()
                                ->preload(),
                            Forms\Components\Select::make('size_guide_id')
                                ->label('Size guide')
                                ->options(fn () => SizeGuide::query()->pluck('title', 'id'))
                                ->searchable(),
                        ])->columns(2),

                    Forms\Components\Section::make('Images')
                        ->schema([
                            Forms\Components\FileUpload::make('image')
                                ->label('Category image')
                                ->image()
                                ->directory('categories')
                                ->imageEditor(),
                            Forms\Components\FileUpload::make('banner')
                                ->label('Category banner')
                                ->image()
                                ->directory('categories')
                                ->imageEditor(),
                        ])->columns(2),

                    Forms\Components\Section::make('SEO')
                        ->schema([
                            Forms\Components\TextInput::make('seo_title')->maxLength(255),
                            Forms\Components\Textarea::make('seo_description')->rows(2)->maxLength(500),
                        ]),
                ]),

            Forms\Components\Group::make()
                ->columnSpan(1)
                ->schema([
                    Forms\Components\Section::make('Status')
                        ->schema([
                            Forms\Components\Toggle::make('is_active')
                                ->label('Active')
                                ->default(true),
                            Forms\Components\TextInput::make('sort_order')
                                ->numeric()
                                ->default(0),
                        ]),
                ]),
        ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                Tables\Columns\ImageColumn::make('image')->label(''),
                Tables\Columns\TextColumn::make('name')->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('parent.name')->label('Parent')->toggleable(),
                Tables\Columns\TextColumn::make('products_count')->counts('products')->label('Products'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active'),
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategories::route('/'),
            'create' => Pages\CreateCategory::route('/create'),
            'edit' => Pages\EditCategory::route('/{record}/edit'),
        ];
    }
}
