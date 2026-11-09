import { prisma } from '../src/lib/db';

async function sanitizeDatabasePrices() {
  console.log('--- Starting Database Price Sanitization (Float -> Integer) ---');

  try {
    // 1. Sanitize Products
    const products = await prisma.product.findMany();
    console.log(`Checking ${products.length} products...`);
    let productsUpdated = 0;

    for (const prod of products) {
      const roundedPrice = Math.round(prod.price);
      const roundedOrig = prod.originalPrice !== null ? Math.round(prod.originalPrice) : null;
      const roundedDisc = prod.discount !== null ? Math.round(prod.discount) : null;

      if (
        prod.price !== roundedPrice ||
        prod.originalPrice !== roundedOrig ||
        prod.discount !== roundedDisc
      ) {
        await prisma.product.update({
          where: { id: prod.id },
          data: {
            price: roundedPrice,
            originalPrice: roundedOrig,
            discount: roundedDisc,
          },
        });
        productsUpdated++;
      }
    }
    console.log(`Updated ${productsUpdated} products to integer pricing.`);

    // 2. Sanitize Orders & Order Items
    const orders = await prisma.order.findMany({
      include: { items: true },
    });
    console.log(`Checking ${orders.length} orders...`);
    let ordersUpdated = 0;

    for (const order of orders) {
      const roundedSubtotal = Math.round(order.subtotal);
      const roundedShipping = Math.round(order.shippingFee);
      const roundedDiscount = order.discountAmount !== null ? Math.round(order.discountAmount) : null;
      const roundedGrandTotal = Math.round(order.grandTotal);
      const roundedCod = Math.round(order.codAmount);
      const roundedOnlineDisc = order.onlineDiscountAmount !== null ? Math.round(order.onlineDiscountAmount) : null;

      const needsOrderUpdate =
        order.subtotal !== roundedSubtotal ||
        order.shippingFee !== roundedShipping ||
        order.discountAmount !== roundedDiscount ||
        order.grandTotal !== roundedGrandTotal ||
        order.codAmount !== roundedCod ||
        order.onlineDiscountAmount !== roundedOnlineDisc;

      if (needsOrderUpdate) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            subtotal: roundedSubtotal,
            shippingFee: roundedShipping,
            discountAmount: roundedDiscount,
            grandTotal: roundedGrandTotal,
            codAmount: roundedCod,
            onlineDiscountAmount: roundedOnlineDisc,
          },
        });
        ordersUpdated++;
      }

      for (const item of order.items) {
        const roundedItemPrice = Math.round(item.price);
        if (item.price !== roundedItemPrice) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { price: roundedItemPrice },
          });
        }
      }
    }
    console.log(`Updated ${ordersUpdated} orders to integer amounts.`);

    // 3. Sanitize Draft Checkouts
    const drafts = await prisma.draftCheckout.findMany();
    console.log(`Checking ${drafts.length} draft checkouts...`);
    let draftsUpdated = 0;

    for (const draft of drafts) {
      const roundedSubtotal = Math.round(draft.subtotal);
      const roundedShipping = Math.round(draft.shippingFee);
      const roundedDiscount = draft.discountAmount !== null ? Math.round(draft.discountAmount) : null;
      const roundedGrandTotal = Math.round(draft.grandTotal);
      const roundedOnlineDisc = draft.onlineDiscountAmount !== null ? Math.round(draft.onlineDiscountAmount) : null;

      if (
        draft.subtotal !== roundedSubtotal ||
        draft.shippingFee !== roundedShipping ||
        draft.discountAmount !== roundedDiscount ||
        draft.grandTotal !== roundedGrandTotal ||
        draft.onlineDiscountAmount !== roundedOnlineDisc
      ) {
        await prisma.draftCheckout.update({
          where: { id: draft.id },
          data: {
            subtotal: roundedSubtotal,
            shippingFee: roundedShipping,
            discountAmount: roundedDiscount,
            grandTotal: roundedGrandTotal,
            onlineDiscountAmount: roundedOnlineDisc,
          },
        });
        draftsUpdated++;
      }
    }
    console.log(`Updated ${draftsUpdated} draft checkouts to integer amounts.`);

    console.log('--- Price Sanitization Complete ---');
  } catch (err: any) {
    console.warn('Database not reachable or offline. Static catalog is sanitized and runtime endpoints will sanitize on load:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

sanitizeDatabasePrices();
