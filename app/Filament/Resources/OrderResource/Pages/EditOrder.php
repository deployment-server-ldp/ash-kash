<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Auth;

class EditOrder extends EditRecord
{
    protected static string $resource = OrderResource::class;

    protected ?string $previousStatus = null;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('invoice')
                ->label('Print invoice')
                ->icon('heroicon-o-printer')
                ->url(fn () => route('admin.orders.invoice', $this->record))
                ->openUrlInNewTab(),
            Actions\Action::make('packing_slip')
                ->label('Packing slip')
                ->icon('heroicon-o-document-text')
                ->url(fn () => route('admin.orders.packing-slip', $this->record))
                ->openUrlInNewTab(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $this->previousStatus = $data['status'] ?? null;

        return $data;
    }

    protected function afterSave(): void
    {
        if ($this->previousStatus !== $this->record->status) {
            OrderStatusHistory::create([
                'order_id' => $this->record->id,
                'status' => $this->record->status,
                'note' => 'Status updated from admin panel',
                'user_id' => Auth::id(),
            ]);

            if ($this->record->status === 'cancelled') {
                Notification::make()
                    ->title('Order cancelled')
                    ->body("Order #{$this->record->order_number} was cancelled.")
                    ->icon('heroicon-o-x-circle')
                    ->iconColor('danger')
                    ->sendToDatabase(User::query()->where('is_active', true)->get());
            }
        }
    }
}
