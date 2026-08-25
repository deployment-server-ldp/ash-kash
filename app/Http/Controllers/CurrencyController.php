<?php

namespace App\Http\Controllers;

use App\Services\CurrencyService;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function switch(Request $request, CurrencyService $currencyService)
    {
        $request->validate(['code' => 'required|string|size:3']);

        $currencyService->setCurrent($request->code);

        return back();
    }
}
