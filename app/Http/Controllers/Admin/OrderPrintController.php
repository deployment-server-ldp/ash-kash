<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;

class OrderPrintController extends Controller
{
    public function invoice(Order $order)
    {
        $order->load('items');

        return view('admin.orders.invoice', compact('order'));
    }

    public function packingSlip(Order $order)
    {
        $order->load('items');

        return view('admin.orders.packing-slip', compact('order'));
    }
}
