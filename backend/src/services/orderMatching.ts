import { prisma } from './prisma';
import { logger } from '../utils/logger';
import { broadcastOrderUpdate, broadcastBalanceUpdate } from '../websocket';
import { OrderSide, OrderType, OrderStatus } from '@tonhub/shared';

/**
 * Order matching engine
 * Matches buy and sell orders and creates trades
 */
export function startOrderMatching(): void {
  logger.info('Starting order matching engine...');

  // Process orders every 2 seconds
  const interval = setInterval(async () => {
    try {
      await matchOrders();
    } catch (error) {
      logger.error('Error in order matching:', error);
    }
  }, 2000);

  // Store interval for cleanup
  (globalThis as any).__orderMatchingInterval = interval;
}

async function matchOrders(): Promise<void> {
  const pairs = ['TON/USDT', 'TON/BTC', 'NOT/TON', 'USDT/TON'];

  for (const pair of pairs) {
    await matchOrdersForPair(pair);
  }
}

async function matchOrdersForPair(pair: string): Promise<void> {
  // Get pending buy orders (highest price first)
  const buyOrders = await prisma.order.findMany({
    where: { pair, side: 'BUY', status: 'PENDING' },
    orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
  });

  // Get pending sell orders (lowest price first)
  const sellOrders = await prisma.order.findMany({
    where: { pair, side: 'SELL', status: 'PENDING' },
    orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
  });

  for (const buyOrder of buyOrders) {
    for (const sellOrder of sellOrders) {
      // Check if prices match
      const buyPrice = parseFloat(buyOrder.price!.toString());
      const sellPrice = parseFloat(sellOrder.price!.toString());

      if (buyPrice < sellPrice) {
        // No more matches possible
        break;
      }

      // Calculate match quantity
      const buyRemaining = parseFloat(buyOrder.quantity.toString()) - parseFloat(buyOrder.filledQuantity.toString());
      const sellRemaining = parseFloat(sellOrder.quantity.toString()) - parseFloat(sellOrder.filledQuantity.toString());
      const matchQuantity = Math.min(buyRemaining, sellRemaining);

      if (matchQuantity <= 0) {
        continue;
      }

      // Execute trade at sell price (price-time priority)
      const tradePrice = sellPrice;
      
      await executeTrade(
        buyOrder,
        sellOrder,
        pair,
        tradePrice,
        matchQuantity
      );
    }
  }
}

async function executeTrade(
  buyOrder: any,
  sellOrder: any,
  pair: string,
  price: number,
  quantity: number
): Promise<void> {
  const [baseCurrency, quoteCurrency] = pair.split('/');
  const total = price * quantity;
  const feePercent = 0.1; // 0.1%

  // Calculate fees
  const buyerFee = quantity * (feePercent / 100);
  const sellerFee = total * (feePercent / 100);

  await prisma.$transaction(async (tx) => {
    // Update buy order
    const buyFilled = parseFloat(buyOrder.filledQuantity.toString()) + quantity;
    const buyStatus = buyFilled >= parseFloat(buyOrder.quantity.toString())
      ? 'FILLED'
      : 'PARTIALLY_FILLED';

    await tx.order.update({
      where: { id: buyOrder.id },
      data: {
        filledQuantity: buyFilled.toString(),
        status: buyStatus,
        filledAt: buyStatus === 'FILLED' ? new Date() : undefined,
      },
    });

    // Update sell order
    const sellFilled = parseFloat(sellOrder.filledQuantity.toString()) + quantity;
    const sellStatus = sellFilled >= parseFloat(sellOrder.quantity.toString())
      ? 'FILLED'
      : 'PARTIALLY_FILLED';

    await tx.order.update({
      where: { id: sellOrder.id },
      data: {
        filledQuantity: sellFilled.toString(),
        status: sellStatus,
        filledAt: sellStatus === 'FILLED' ? new Date() : undefined,
      },
    });

    // Create trade records
    await tx.trade.create({
      data: {
        tradeId: `TRD-${Date.now()}-1`,
        orderId: buyOrder.id,
        makerOrderId: sellOrder.id,
        pair,
        price: price.toString(),
        quantity: quantity.toString(),
        fee: buyerFee.toString(),
        feeCurrency: baseCurrency,
        isMaker: false,
      },
    });

    await tx.trade.create({
      data: {
        tradeId: `TRD-${Date.now()}-2`,
        orderId: sellOrder.id,
        makerOrderId: buyOrder.id,
        pair,
        price: price.toString(),
        quantity: quantity.toString(),
        fee: sellerFee.toString(),
        feeCurrency: quoteCurrency,
        isMaker: true,
      },
    });

    // Transfer balances
    // Buyer receives base currency
    await tx.balance.update({
      where: {
        userId_currency: {
          userId: buyOrder.userId,
          currency: baseCurrency,
        },
      },
      data: {
        available: {
          increment: (quantity - buyerFee).toString(),
        },
      },
    });

    // Seller receives quote currency
    await tx.balance.update({
      where: {
        userId_currency: {
          userId: sellOrder.userId,
          currency: quoteCurrency,
        },
      },
      data: {
        available: {
          increment: (total - sellerFee).toString(),
        },
      },
    });

    // Unlock and deduct locked balances
    // Buyer: unlock quote currency
    await tx.balance.update({
      where: {
        userId_currency: {
          userId: buyOrder.userId,
          currency: quoteCurrency,
        },
      },
      data: {
        locked: {
          decrement: total.toString(),
        },
      },
    });

    // Seller: unlock base currency
    await tx.balance.update({
      where: {
        userId_currency: {
          userId: sellOrder.userId,
          currency: baseCurrency,
        },
      },
      data: {
        locked: {
          decrement: quantity.toString(),
        },
      },
    });
  });

  logger.info(`Trade executed: ${quantity} ${baseCurrency} @ ${price} ${quoteCurrency}`);

  // Notify users via WebSocket
  broadcastOrderUpdate(buyOrder.userId.toString(), {
    orderId: buyOrder.orderId,
    status: buyStatus.toLowerCase(),
    filledQuantity: (parseFloat(buyOrder.filledQuantity.toString()) + quantity).toString(),
  });

  broadcastOrderUpdate(sellOrder.userId.toString(), {
    orderId: sellOrder.orderId,
    status: sellStatus.toLowerCase(),
    filledQuantity: (parseFloat(sellOrder.filledQuantity.toString()) + quantity).toString(),
  });

  broadcastBalanceUpdate(buyOrder.userId.toString(), {
    currency: baseCurrency,
    change: (quantity - buyerFee).toString(),
  });

  broadcastBalanceUpdate(sellOrder.userId.toString(), {
    currency: quoteCurrency,
    change: (total - sellerFee).toString(),
  });
}

export function stopOrderMatching(): void {
  const interval = (globalThis as any).__orderMatchingInterval;
  if (interval) {
    clearInterval(interval);
    logger.info('Order matching stopped');
  }
}
