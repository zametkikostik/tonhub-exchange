import { Router } from 'express';
import { prisma } from '../services/prisma';
import { getRedis, setCache, getCache } from '../services/redis';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

export const tradeRoutes = Router();

/**
 * GET /api/trades/:pair
 * Get recent trades for a pair
 */
tradeRoutes.get('/:pair', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { pair } = req.params;
    const { limit = '50' } = req.query;

    // Try cache first
    const cacheKey = `trades:${pair}`;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const trades = await prisma.trade.findMany({
      where: { pair },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        order: {
          select: { side: true },
        },
      },
    });

    const result = trades.map((t) => ({
      id: t.tradeId,
      price: t.price.toString(),
      quantity: t.quantity.toString(),
      side: t.order.side.toLowerCase(),
      timestamp: t.createdAt.getTime(),
    }));

    // Cache for 5 seconds
    await setCache(cacheKey, result, 5);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orderbook/:pair
 * Get order book for a pair
 */
tradeRoutes.get('/orderbook/:pair', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { pair } = req.params;
    const { depth = '20' } = req.query;

    // Try cache first
    const cacheKey = `orderbook:${pair}`;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const depthNum = parseInt(depth as string);

    // Get active buy orders (bids)
    const bids = await prisma.order.findMany({
      where: {
        pair,
        side: 'BUY',
        status: 'PENDING',
      },
      orderBy: [
        { price: 'desc' },
        { createdAt: 'asc' },
      ],
      take: depthNum,
      select: {
        price: true,
        quantity: true,
        filledQuantity: true,
      },
    });

    // Get active sell orders (asks)
    const asks = await prisma.order.findMany({
      where: {
        pair,
        side: 'SELL',
        status: 'PENDING',
      },
      orderBy: [
        { price: 'asc' },
        { createdAt: 'asc' },
      ],
      take: depthNum,
      select: {
        price: true,
        quantity: true,
        filledQuantity: true,
      },
    });

    // Aggregate orders by price
    const aggregateOrders = (orders: any[], side: 'bid' | 'ask') => {
      const aggregated = new Map<string, number>();
      
      orders.forEach((order) => {
        const price = order.price!.toString();
        const remainingQty = parseFloat(order.quantity.toString()) - parseFloat(order.filledQuantity.toString());
        
        if (remainingQty > 0) {
          const current = aggregated.get(price) || 0;
          aggregated.set(price, current + remainingQty);
        }
      });

      return Array.from(aggregated.entries()).map(([price, quantity]) => ({
        price,
        quantity: quantity.toString(),
      }));
    };

    const orderBook = {
      pair,
      bids: aggregateOrders(bids, 'bid'),
      asks: aggregateOrders(asks, 'ask'),
      timestamp: Date.now(),
    };

    // Cache for 1 second
    await setCache(cacheKey, orderBook, 1);

    res.json({ success: true, data: orderBook });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prices
 * Get current prices for all pairs
 */
tradeRoutes.get('/prices', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const cacheKey = 'prices:all';
    const cached = await getCache(cacheKey);
    
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const pairs = ['TON/USDT', 'TON/BTC', 'NOT/TON', 'USDT/TON'];
    const prices: Record<string, { price: string; change24h: string; high24h: string; low24h: string }> = {};

    for (const pair of pairs) {
      // Get last trade price
      const lastTrade = await prisma.trade.findFirst({
        where: { pair },
        orderBy: { createdAt: 'desc' },
        select: { price: true, createdAt: true },
      });

      // Get 24h stats
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const stats = await prisma.trade.groupBy({
        by: ['pair'],
        where: {
          pair,
          createdAt: { gte: twentyFourHoursAgo },
        },
        _avg: { price: true },
        _max: { price: true },
        _min: { price: true },
      });

      const price = lastTrade ? lastTrade.price.toString() : '0';
      const avgPrice = stats[0]?._avg.price?.toString() ?? '0';
      const highPrice = stats[0]?._max.price?.toString() ?? '0';
      const lowPrice = stats[0]?._min.price?.toString() ?? '0';

      // Calculate 24h change
      const change24h = lastTrade && avgPrice !== '0'
        ? (((parseFloat(price) - parseFloat(avgPrice)) / parseFloat(avgPrice)) * 100).toFixed(2)
        : '0';

      prices[pair] = {
        price,
        change24h,
        high24h: highPrice,
        low24h: lowPrice,
      };
    }

    // Cache for 10 seconds
    await setCache(cacheKey, prices, 10);

    res.json({ success: true, data: prices });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tickers
 * Get 24h tickers for all pairs
 */
tradeRoutes.get('/tickers', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const cacheKey = 'tickers:all';
    const cached = await getCache(cacheKey);
    
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const pairs = ['TON/USDT', 'TON/BTC', 'NOT/TON', 'USDT/TON'];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tickers = await Promise.all(
      pairs.map(async (pair) => {
        const stats = await prisma.trade.groupBy({
          by: ['pair'],
          where: {
            pair,
            createdAt: { gte: twentyFourHoursAgo },
          },
          _avg: { price: true },
          _max: { price: true },
          _min: { price: true },
          _sum: { quantity: true },
          _count: true,
        });

        const lastTrade = await prisma.trade.findFirst({
          where: { pair },
          orderBy: { createdAt: 'desc' },
          select: { price: true },
        });

        const s = stats[0];
        if (!s) {
          return null;
        }

        return {
          pair,
          lastPrice: lastTrade?.price.toString() ?? '0',
          highPrice: s._max.price?.toString() ?? '0',
          lowPrice: s._min.price?.toString() ?? '0',
          volume: s._sum.quantity?.toString() ?? '0',
          quoteVolume: '0', // Would need price * quantity calculation
          trades: s._count,
          change24h: lastTrade && s._avg.price
            ? (((parseFloat(lastTrade.price.toString()) - parseFloat(s._avg.price.toString())) / parseFloat(s._avg.price.toString())) * 100).toFixed(2)
            : '0',
        };
      })
    );

    const result = tickers.filter((t): t is NonNullable<typeof t> => t !== null);
    
    // Cache for 30 seconds
    await setCache(cacheKey, result, 30);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
