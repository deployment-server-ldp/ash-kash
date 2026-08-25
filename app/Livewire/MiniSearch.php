<?php

namespace App\Livewire;

use App\Models\Product;
use Livewire\Component;

class MiniSearch extends Component
{
    public string $query = '';

    public function getResultsProperty()
    {
        if (mb_strlen($this->query) < 2) {
            return collect();
        }

        return Product::query()
            ->active()
            ->where(function ($q) {
                $q->where('name', 'like', "%{$this->query}%")
                    ->orWhere('sku', 'like', "%{$this->query}%")
                    ->orWhere('description', 'like', "%{$this->query}%");
            })
            ->limit(6)
            ->get();
    }

    public function render()
    {
        return view('livewire.mini-search', ['results' => $this->results]);
    }
}
