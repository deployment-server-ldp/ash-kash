<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class ManageSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'Store settings';

    protected static ?string $navigationLabel = 'General settings';

    protected static string $view = 'filament.pages.manage-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(Setting::allSettings()->toArray());
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Settings')->tabs([
                    Forms\Components\Tabs\Tab::make('Brand')->schema([
                        Forms\Components\TextInput::make('store_name')->default(config('app.name')),
                        Forms\Components\FileUpload::make('logo')->image(),
                        Forms\Components\FileUpload::make('favicon')->image(),
                        Forms\Components\ColorPicker::make('brand_color')->default('#a8834f'),
                    ])->columns(2),

                    Forms\Components\Tabs\Tab::make('Contact & socials')->schema([
                        Forms\Components\TextInput::make('contact_email')->email(),
                        Forms\Components\TextInput::make('contact_phone'),
                        Forms\Components\Textarea::make('contact_address')->rows(2),
                        Forms\Components\TextInput::make('social_instagram')->prefix('https://instagram.com/'),
                        Forms\Components\TextInput::make('social_facebook')->prefix('https://facebook.com/'),
                        Forms\Components\TextInput::make('social_tiktok')->prefix('https://tiktok.com/@'),
                        Forms\Components\TextInput::make('social_pinterest')->prefix('https://pinterest.com/'),
                    ])->columns(2),

                    Forms\Components\Tabs\Tab::make('Footer')->schema([
                        Forms\Components\Textarea::make('footer_about')->rows(3),
                        Forms\Components\TextInput::make('footer_copyright'),
                    ]),

                    Forms\Components\Tabs\Tab::make('Checkout & shipping')->schema([
                        Forms\Components\Toggle::make('cod_enabled')->label('Cash on Delivery enabled')->default(true),
                        Forms\Components\TextInput::make('free_shipping_note'),
                    ]),

                    Forms\Components\Tabs\Tab::make('SEO defaults')->schema([
                        Forms\Components\TextInput::make('seo_default_title'),
                        Forms\Components\Textarea::make('seo_default_description')->rows(2),
                        Forms\Components\TextInput::make('seo_default_keywords'),
                        Forms\Components\FileUpload::make('seo_default_og_image')->image(),
                    ]),

                    Forms\Components\Tabs\Tab::make('Newsletter')->schema([
                        Forms\Components\Select::make('newsletter_provider')
                            ->options([
                                'none' => 'Not connected',
                                'mailchimp' => 'Mailchimp',
                                'klaviyo' => 'Klaviyo',
                                'brevo' => 'Brevo',
                            ])
                            ->default('none'),
                        Forms\Components\TextInput::make('newsletter_api_key')->password()->revealable(),
                    ]),
                ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            Setting::set($key, is_array($value) ? json_encode($value) : $value);
        }

        Notification::make()
            ->title('Settings saved')
            ->success()
            ->send();
    }
}
