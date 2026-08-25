<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Packing Slip {{ $order->order_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1b1815; padding: 40px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <button class="no-print" onclick="window.print()">Print</button>
    <h1>Packing Slip</h1>
    <p>Order #{{ $order->order_number }} — {{ $order->created_at->format('F j, Y') }}</p>

    <p><strong>Ship To:</strong><br>
        {{ $order->customer_name }}<br>
        {{ $order->shipping_address['address_line1'] ?? '' }} {{ $order->shipping_address['address_line2'] ?? '' }}<br>
        {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['postal_code'] ?? '' }}<br>
        {{ $order->shipping_address['country_code'] ?? '' }}<br>
        {{ $order->phone }}
    </p>

    <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Qty</th></tr></thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }} @if($item->variant_title) ({{ $item->variant_title }}) @endif</td>
                    <td>{{ $item->sku }}</td>
                    <td>{{ $item->quantity }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p style="margin-top:30px;">Payment: Cash on Delivery — collect {{ $order->currency_code }} {{ number_format($order->grand_total, 2) }} on delivery.</p>
</body>
</html>
