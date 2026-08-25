<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1b1815; padding: 40px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
        .totals td { border: none; }
        .header { display: flex; justify-content: space-between; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <button class="no-print" onclick="window.print()">Print</button>
    <div class="header">
        <div>
            <h1>{{ setting('store_name', config('app.name')) }}</h1>
            <p>Invoice #{{ $order->order_number }}</p>
            <p>{{ $order->created_at->format('F j, Y') }}</p>
        </div>
        <div>
            <strong>Bill To:</strong><br>
            {{ $order->customer_name }}<br>
            {{ $order->shipping_address['address_line1'] ?? '' }}<br>
            {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['country_code'] ?? '' }}<br>
            {{ $order->phone }}
        </div>
    </div>

    <table>
        <thead>
            <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }} @if($item->variant_title) ({{ $item->variant_title }}) @endif</td>
                    <td>{{ $item->sku }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format($item->unit_price, 2) }}</td>
                    <td>{{ number_format($item->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
        <tbody class="totals">
            <tr><td colspan="4">Subtotal</td><td>{{ number_format($order->subtotal, 2) }}</td></tr>
            <tr><td colspan="4">Discount</td><td>-{{ number_format($order->discount_total, 2) }}</td></tr>
            <tr><td colspan="4">Shipping</td><td>{{ number_format($order->shipping_total, 2) }}</td></tr>
            <tr><td colspan="4"><strong>Total ({{ $order->currency_code }})</strong></td><td><strong>{{ number_format($order->grand_total, 2) }}</strong></td></tr>
        </tbody>
    </table>

    <p style="margin-top:30px;">Payment method: Cash on Delivery</p>
</body>
</html>
