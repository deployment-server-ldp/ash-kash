import "server-only";
import { prisma } from "@/lib/prisma";
import { getCartWithItems } from "@/lib/cart";
import { computeCartTotals } from "@/lib/pricing";
import { resolveCurrentCurrency } from "@/lib/currency/service";
import { convertAmount } from "@/lib/currency/format";
import { generateOrderNumber } from "@/lib/utils";

export class CheckoutError extends Error {}

export type CheckoutInput = {
  cartId: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string;
  countryCode: string;
  state: string | null;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  notes: string | null;
  ipAddress: string | null;
};

export async function createOrderFromCart(input: CheckoutInput) {
  const cart = await getCartWithItems(input.cartId);
  if (cart.items.length === 0) {
    throw new CheckoutError("Your bag is empty.");
  }

  const settings = await prisma.storeSetting.findUnique({ where: { id: 1 } });
  if (!settings?.codEnabled) {
    throw new CheckoutError("Checkout is currently unavailable. Please try again later.");
  }

  const totals = await computeCartTotals(cart.id, input.countryCode, input.userId);
  if (totals.couponError) {
    throw new CheckoutError(totals.couponError);
  }

  const currency = await resolveCurrentCurrency();
  // All prices computed above are in the store's base currency. Orders are recorded in
  // the customer's chosen display currency, so every stored amount must be converted now
  // — this is the one point where that conversion happens; everything downstream (order
  // totals, invoices, admin views) trusts these numbers as already being in currencyCode.
  const convert = (baseAmount: number) => convertAmount(baseAmount, currency);
  const convertedSubtotal = convert(totals.subtotal);
  const convertedDiscountTotal = convert(totals.discountTotal);
  const convertedShippingTotal = convert(totals.shippingTotal);
  const convertedTaxTotal = convert(totals.taxTotal);
  const convertedGrandTotal = convert(totals.grandTotal);

  const order = await prisma.$transaction(async (tx) => {
    // Re-validate stock inside the transaction to guard against race conditions.
    for (const item of cart.items) {
      if (item.productVariant) {
        if (item.product.trackInventory && item.productVariant.inventoryQuantity < item.quantity) {
          throw new CheckoutError(`Not enough stock for ${item.product.name}.`);
        }
      } else if (item.product.trackInventory && item.product.inventoryQuantity < item.quantity) {
        throw new CheckoutError(`Not enough stock for ${item.product.name}.`);
      }
    }

    const shippingAddress = {
      fullName: input.name,
      phone: input.phone,
      countryCode: input.countryCode,
      state: input.state,
      city: input.city,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      postalCode: input.postalCode,
    };

    const createdOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: input.userId,
        couponId: cart.couponId,
        couponCode: cart.coupon?.code ?? null,
        status: "PENDING",
        customerName: input.name,
        email: input.email,
        phone: input.phone,
        currencyCode: currency.code,
        exchangeRateSnapshot: currency.exchangeRate,
        subtotal: convertedSubtotal,
        discountTotal: convertedDiscountTotal,
        shippingTotal: convertedShippingTotal,
        taxTotal: convertedTaxTotal,
        grandTotal: convertedGrandTotal,
        shippingAddress,
        billingAddress: shippingAddress,
        shippingMethodId: totals.shippingMethodId,
        shippingMethodName: totals.shippingMethodName,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        notes: input.notes,
        ipAddress: input.ipAddress,
        countryCode: input.countryCode,
      },
    });

    for (const item of cart.items) {
      const baseUnitPrice = Number(item.productVariant?.price ?? item.product.price);
      await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          productName: item.product.name,
          variantTitle: item.productVariant?.title ?? null,
          sku: item.productVariant?.sku ?? item.product.sku,
          image: item.product.images[0]?.url ?? null,
          quantity: item.quantity,
          unitPrice: convert(baseUnitPrice),
          totalPrice: convert(baseUnitPrice * item.quantity),
        },
      });

      if (item.productVariant) {
        const after = item.productVariant.inventoryQuantity - item.quantity;
        await tx.productVariant.update({
          where: { id: item.productVariant.id },
          data: { inventoryQuantity: after },
        });
        await tx.inventoryHistory.create({
          data: {
            productId: item.productId,
            productVariantId: item.productVariant.id,
            type: "ORDER",
            quantityChange: -item.quantity,
            quantityAfter: after,
            note: `Order ${createdOrder.orderNumber}`,
          },
        });
      } else {
        const after = item.product.inventoryQuantity - item.quantity;
        await tx.product.update({ where: { id: item.productId }, data: { inventoryQuantity: after } });
        await tx.inventoryHistory.create({
          data: {
            productId: item.productId,
            type: "ORDER",
            quantityChange: -item.quantity,
            quantityAfter: after,
            note: `Order ${createdOrder.orderNumber}`,
          },
        });
      }
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: createdOrder.id,
        status: "PENDING",
        note: "Order placed by customer (Cash on Delivery).",
      },
    });

    if (cart.couponId && cart.coupon) {
      await tx.coupon.update({ where: { id: cart.couponId }, data: { usedCount: { increment: 1 } } });
      await tx.couponUsage.create({
        data: {
          couponId: cart.couponId,
          userId: input.userId,
          orderId: createdOrder.id,
          discountAmount: convertedDiscountTotal,
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { couponId: null } });

    return createdOrder;
  });

  await prisma.notification
    .create({
      data: {
        type: "NEW_ORDER",
        title: "New order received",
        message: `Order ${order.orderNumber} was placed for ${currency.symbol}${convertedGrandTotal.toFixed(2)}.`,
        data: { orderId: order.id },
      },
    })
    .catch(() => undefined);

  return order;
}
