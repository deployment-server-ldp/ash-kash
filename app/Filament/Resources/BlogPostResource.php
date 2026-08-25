<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BlogPostResource\Pages;
use App\Models\BlogPost;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class BlogPostResource extends Resource
{
    protected static ?string $model = BlogPost::class;

    protected static ?string $navigationIcon = 'heroicon-o-newspaper';

    protected static ?string $navigationGroup = 'Blog';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()->columnSpan(2)->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Forms\Set $set, ?string $state) => $set('slug', Str::slug($state))),
                Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Forms\Components\Textarea::make('excerpt')->rows(2)->maxLength(500),
                Forms\Components\RichEditor::make('content')->required()->columnSpanFull(),
            ]),
            Forms\Components\Group::make()->columnSpan(1)->schema([
                Forms\Components\Section::make()->schema([
                    Forms\Components\FileUpload::make('featured_image')->image()->directory('blog'),
                    Forms\Components\Select::make('blog_category_id')->relationship('category', 'name'),
                    Forms\Components\TagsInput::make('tags'),
                    Forms\Components\Toggle::make('is_published')->default(false)->live(),
                    Forms\Components\DateTimePicker::make('published_at')
                        ->visible(fn (Forms\Get $get) => $get('is_published'))
                        ->default(now()),
                ]),
                Forms\Components\Section::make('SEO')->schema([
                    Forms\Components\TextInput::make('seo_title'),
                    Forms\Components\Textarea::make('seo_description')->rows(2),
                ]),
            ]),
        ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\ImageColumn::make('featured_image')->label(''),
                Tables\Columns\TextColumn::make('title')->searchable(),
                Tables\Columns\TextColumn::make('category.name'),
                Tables\Columns\IconColumn::make('is_published')->boolean(),
                Tables\Columns\TextColumn::make('published_at')->dateTime(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBlogPosts::route('/'),
            'create' => Pages\CreateBlogPost::route('/create'),
            'edit' => Pages\EditBlogPost::route('/{record}/edit'),
        ];
    }
}
