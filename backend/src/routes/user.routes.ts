import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../services/prisma';
import { ApiError, ErrorCodes } from '@tonhub/shared';

export const userRoutes = Router();

// All routes require authentication
userRoutes.use(authMiddleware);

/**
 * GET /api/user/balances
 * Get user balances
 */
userRoutes.get('/balances', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;

    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        balances: {
          select: {
            currency: true,
            available: true,
            locked: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    const balances = user.balances.map((b) => ({
      currency: b.currency,
      available: b.available.toString(),
      locked: b.locked.toString(),
    }));

    res.json({
      success: true,
      data: { balances },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/profile
 * Get user profile
 */
userRoutes.get('/profile', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;

    const user = await prisma.user.findUnique({
      where: { telegramId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        languageCode: true,
        isPremium: true,
        tonWalletAddress: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            referrals: true,
            orders: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    res.json({
      success: true,
      data: {
        ...user,
        id: user.id.toString(),
        telegramId: user.telegramId.toString(),
        referralsCount: user._count.referrals,
        ordersCount: user._count.orders,
        transactionsCount: user._count.transactions,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/orders
 * Get user orders with filtering
 */
userRoutes.get('/orders', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const { pair, status, limit = '20', offset = '0' } = req.query;

    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    const where: any = { userId: user.id };

    if (pair) {
      where.pair = pair as string;
    }

    if (status) {
      where.status = status as string;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: orders.map((o) => ({
          orderId: o.orderId,
          pair: o.pair,
          side: o.side,
          type: o.type,
          status: o.status,
          price: o.price?.toString(),
          quantity: o.quantity.toString(),
          filledQuantity: o.filledQuantity.toString(),
          total: o.total?.toString(),
          fee: o.fee.toString(),
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        })),
        total,
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        limit: parseInt(limit as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/transactions
 * Get user transactions
 */
userRoutes.get('/transactions', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const { type, status, limit = '20', offset = '0' } = req.query;

    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    const where: any = { userId: user.id };

    if (type) {
      where.type = type as string;
    }

    if (status) {
      where.status = status as string;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: transactions.map((t) => ({
          txId: t.txId,
          type: t.type,
          status: t.status,
          currency: t.currency,
          amount: t.amount.toString(),
          fee: t.fee.toString(),
          txHash: t.txHash ?? undefined,
          fromAddress: t.fromAddress ?? undefined,
          toAddress: t.toAddress ?? undefined,
          memo: t.memo ?? undefined,
          confirmations: t.confirmations,
          createdAt: t.createdAt.toISOString(),
          completedAt: t.completedAt?.toISOString(),
        })),
        total,
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        limit: parseInt(limit as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/user/trades
 * Get user trades
 */
userRoutes.get('/trades', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const { pair, limit = '50', offset = '0' } = req.query;

    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    const userOrders = await prisma.order.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const orderIds = userOrders.map((o) => o.id);

    const where: any = { orderId: { in: orderIds } };

    if (pair) {
      where.pair = pair as string;
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        include: {
          order: {
            select: { side: true, pair: true },
          },
        },
      }),
      prisma.trade.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: trades.map((t) => ({
          tradeId: t.tradeId,
          orderId: t.order.orderId,
          pair: t.pair,
          side: t.order.side,
          price: t.price.toString(),
          quantity: t.quantity.toString(),
          fee: t.fee.toString(),
          feeCurrency: t.feeCurrency,
          isMaker: t.isMaker,
          createdAt: t.createdAt.toISOString(),
        })),
        total,
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        limit: parseInt(limit as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
      },
    });
  } catch (error) {
    next(error);
  }
});
