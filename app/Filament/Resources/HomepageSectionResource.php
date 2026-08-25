<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomepageSectionResource\Pages;
use App\Models\HomepageSection;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HomepageSectionResource extends Resource
{
    protected static ?string $model = HomepageSection::class;

    protected static ?string $navigationIcon = 'heroicon-o-view-columns';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Homepage sections';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('type')
                ->options([
                    'hero_slider' => 'Hero slider',
                    'featured_products' => 'Featured products',
                    'categories' => 'Categories',
                    'collections' => 'Collections',
                    'testimonials' => 'Testimonials',
                    'instagram' => 'Instagram / social',
                    'newsletter' => 'Newsletter',
                    'brand_story' => 'Brand story',
                    'promo_banner' => 'Promo banner',
                ])
                ->required()
                ->live(),
            Forms\Components\TextInput::make('title'),
            Forms\Components\TextInput::make('subtitle'),
            Forms\Components\Textarea::make('content')->rows(3)->columnSpanFull(),
            Forms\Components\FileUpload::make('image')->image()->directory('homepage'),
            Forms\Components\TextInput::make('button_text'),
            Forms\Components\TextInput::make('button_url'),

            Forms\Components\Select::make('settings.source')
                ->label('Product source')
                ->options([
                    'latest' => 'Latest products',
                    'best_seller' => 'Best sellers',
                    'featured' => 'Featured products',
                    'sale' => 'Sale products',
                    'custom' => 'Custom selection',
                ])
                ->visible(fn (Forms\Get $get) => $get('type') === 'featured_products'),
            Forms\Components\TextInput::make('settings.limit')
                ->numeric()
                ->default(8)
                ->label('Number of products')
                ->visible(fn (Forms\Get $get) => $get('type') === 'featured_products'),
            Forms\Components\Select::make('settings.product_ids')
                ->label('Products (for custom selection)')
                ->multiple()
                ->options(fn () => Product::query()->pluck('name', 'id'))
                ->searchable()
                ->visible(fn (Forms\Get $get) => $get('type') === 'featured_products' && $get('settings.source') === 'custom'),

            Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\TextColumn::make('title'),
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
            'index' => Pages\ListHomepageSections::route('/'),
            'create' => Pages\CreateHomepageSection::route('/create'),
            'edit' => Pages\EditHomepageSection::route('/{record}/edit'),
        ];
    }
}
