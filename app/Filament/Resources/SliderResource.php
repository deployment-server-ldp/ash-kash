<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SliderResource\Pages;
use App\Models\Slider;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SliderResource extends Resource
{
    protected static ?string $model = Slider::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()->columnSpan(2)->schema([
                Forms\Components\Section::make('Slide content')->schema([
                    Forms\Components\TextInput::make('tag')->placeholder('NEW SEASON'),
                    Forms\Components\TextInput::make('title')->placeholder('Discover the latest collection'),
                    Forms\Components\TextInput::make('subtitle'),
                    Forms\Components\Textarea::make('description')->rows(2)->columnSpanFull(),
                    Forms\Components\TextInput::make('button_text')->placeholder('Shop Now'),
                    Forms\Components\TextInput::make('button_url')->placeholder('/shop'),
                    Forms\Components\Select::make('text_align')
                        ->options(['left' => 'Left', 'center' => 'Center', 'right' => 'Right'])
                        ->default('left'),
                ])->columns(2),
                Forms\Components\Section::make('Images')->schema([
                    Forms\Components\FileUpload::make('desktop_image')
                        ->image()
                        ->required()
                        ->directory('sliders')
                        ->imageEditor()
                        ->imageEditorAspectRatios(['16:9', '21:9']),
                    Forms\Components\FileUpload::make('mobile_image')
                        ->image()
                        ->directory('sliders')
                        ->imageEditor()
                        ->imageEditorAspectRatios(['4:5', '1:1']),
                ])->columns(2),
            ]),
            Forms\Components\Group::make()->columnSpan(1)->schema([
                Forms\Components\Section::make('Settings')->schema([
                    Forms\Components\Toggle::make('is_active')->default(true),
                    Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                    Forms\Components\TextInput::make('overlay_opacity')->numeric()->suffix('%')->default(20),
                    Forms\Components\TextInput::make('duration_ms')->numeric()->default(6000)->label('Slide duration (ms)'),
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
                Tables\Columns\ImageColumn::make('desktop_image')->label(''),
                Tables\Columns\TextColumn::make('title'),
                Tables\Columns\TextColumn::make('tag')->badge(),
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
            'index' => Pages\ListSliders::route('/'),
            'create' => Pages\CreateSlider::route('/create'),
            'edit' => Pages\EditSlider::route('/{record}/edit'),
        ];
    }
}
