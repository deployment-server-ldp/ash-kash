<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SizeGuideResource\Pages;
use App\Models\SizeGuide;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SizeGuideResource extends Resource
{
    protected static ?string $model = SizeGuide::class;

    protected static ?string $navigationIcon = 'heroicon-o-scale';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 7;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('title')->required(),
            Forms\Components\Select::make('unit')
                ->options(['in' => 'Inches', 'cm' => 'Centimeters'])
                ->default('in'),
            Forms\Components\Textarea::make('instructions')->rows(2)->columnSpanFull(),
            Forms\Components\FileUpload::make('image')->image()->directory('size-guides'),
            Forms\Components\Repeater::make('rows')
                ->relationship()
                ->schema([
                    Forms\Components\TextInput::make('size_name')->required()->placeholder('S, M, L...'),
                    Forms\Components\KeyValue::make('measurements')
                        ->keyLabel('Measurement (e.g. Bust)')
                        ->valueLabel('Value')
                        ->columnSpanFull(),
                    Forms\Components\TextInput::make('position')->numeric()->default(0),
                ])
                ->columns(2)
                ->addActionLabel('Add size row')
                ->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('title'),
            Tables\Columns\TextColumn::make('unit'),
            Tables\Columns\TextColumn::make('rows_count')->counts('rows')->label('Sizes'),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSizeGuides::route('/'),
            'create' => Pages\CreateSizeGuide::route('/create'),
            'edit' => Pages\EditSizeGuide::route('/{record}/edit'),
        ];
    }
}
