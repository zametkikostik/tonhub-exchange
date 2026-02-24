import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../services/prisma';
import { ApiError, ErrorCodes, OrderSide, OrderType } from '../types';
import { z } from 'zod';
import { config } from '../config';

export const orderRoutes = Router();

// All routes require authentication
orderRoutes.use(authMiddleware);

const createOrderSchema = z.object({
  pair: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  price: z.string().optional(),
  quantity: z.string().min(1),
});

const SUPPORTED_PAIRS = ['TON/USDT', 'TON/BTC', 'NOT/TON', 'USDT/TON'];

/**
 * POST /api/orders
 * Create a new order
 */
orderRoutes.post('/', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const body = createOrderSchema.parse(req.body);

    // Validate pair
    if (!SUPPORTED_PAIRS.includes(body.pair)) {
      throw new ApiError(
        ErrorCodes.INVALID_ORDER_PAIR,
        StatusCodes.BAD_REQUEST,
        `Unsupported trading pair: ${body.pair}. Supported: ${SUPPORTED_PAIRS.join(', ')}`
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: { balances: true },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    const [baseCurrency, quoteCurrency] = body.pair.split('/');
    const quantity = parseFloat(body.quantity);
    const price = body.price ? parseFloat(body.price) : null;

    // Calculate required balance
    let requiredBalance: { currency: string; amount: number };
    
    if (body.side === 'buy') {
      if (body.type === 'market') {
        throw new ApiError(
          ErrorCodes.INVALID_INPUT,
          StatusCodes.BAD_REQUEST,
          'Market buy orders require a price parameter'
        );
      }
      requiredBalance = {
        currency: quoteCurrency,
        amount: quantity * (price ?? 0),
      };
    } else {
      requiredBalance = {
        currency: baseCurrency,
        amount: quantity,
      };
    }

    // Check balance
    const balance = user.balances.find((b) => b.currency === requiredBalance.currency);
    
    if (!balance || parseFloat(balance.available.toString()) < requiredBalance.amount) {
      throw new ApiError(
        ErrorCodes.INSUFFICIENT_BALANCE,
        StatusCodes.BAD_REQUEST,
        `Insufficient ${requiredBalance.currency} balance. Required: ${requiredBalance.amount}, Available: ${balance?.available ?? 0}`
      );
    }

    // Calculate fee
    const fee = quantity * (config.tradingFeePercent / 100);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        pair: body.pair,
        side: body.side as OrderSide,
        type: body.type as OrderType,
        status: 'PENDING',
        price: price?.toString() ?? null,
        quantity: quantity.toString(),
        filledQuantity: '0',
        total: body.type === 'market' ? undefined : (quantity * (price ?? 0)).toString(),
        fee: fee.toString(),
      },
    });

    // Lock balance
    await prisma.balance.update({
      where: {
        userId_currency: {
          userId: user.id,
          currency: requiredBalance.currency,
        },
      },
      data: {
        available: {
          decrement: requiredBalance.amount.toString(),
        },
        locked: {
          increment: requiredBalance.amount.toString(),
        },
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        orderId: order.orderId,
        pair: order.pair,
        side: order.side,
        type: order.type,
        status: order.status.toLowerCase(),
        price: order.price?.toString(),
        quantity: order.quantity.toString(),
        filledQuantity: order.filledQuantity.toString(),
        total: order.total?.toString(),
        fee: order.fee.toString(),
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        StatusCodes.BAD_REQUEST,
        'Validation error',
        error.errors
      ));
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/orders/:orderId
 * Get order by ID
 */
orderRoutes.get('/:orderId', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const { orderId } = req.params;

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

    const order = await prisma.order.findFirst({
      where: {
        orderId,
        userId: user.id,
      },
    });

    if (!order) {
      throw new ApiError(
        ErrorCodes.ORDER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'Order not found'
      );
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        pair: order.pair,
        side: order.side,
        type: order.type,
        status: order.status.toLowerCase(),
        price: order.price?.toString(),
        quantity: order.quantity.toString(),
        filledQuantity: order.filledQuantity.toString(),
        total: order.total?.toString(),
        fee: order.fee.toString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        filledAt: order.filledAt?.toISOString(),
        cancelledAt: order.cancelledAt?.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/orders/:orderId
 * Cancel an order
 */
orderRoutes.delete('/:orderId', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const { orderId } = req.params;

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

    const order = await prisma.order.findFirst({
      where: {
        orderId,
        userId: user.id,
      },
    });

    if (!order) {
      throw new ApiError(
        ErrorCodes.ORDER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'Order not found'
      );
    }

    if (order.status === 'FILLED' || order.status === 'CANCELLED') {
      throw new ApiError(
        ErrorCodes.ORDER_ALREADY_FILLED,
        StatusCodes.BAD_REQUEST,
        `Cannot cancel order with status: ${order.status}`
      );
    }

    // Calculate remaining locked amount
    const filledQuantity = parseFloat(order.filledQuantity.toString());
    const totalQuantity = parseFloat(order.quantity.toString());
    const remainingQuantity = totalQuantity - filledQuantity;

    const [baseCurrency, quoteCurrency] = order.pair.split('/');
    
    let refundAmount: number;
    let refundCurrency: string;

    if (order.side === 'buy') {
      refundAmount = remainingQuantity * parseFloat(order.price!.toString());
      refundCurrency = quoteCurrency;
    } else {
      refundAmount = remainingQuantity;
      refundCurrency = baseCurrency;
    }

    // Update order status and refund balance
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      }),
      prisma.balance.update({
        where: {
          userId_currency: {
            userId: user.id,
            currency: refundCurrency,
          },
        },
        data: {
          locked: {
            decrement: refundAmount.toString(),
          },
          available: {
            increment: refundAmount.toString(),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        refundedAmount: refundAmount.toString(),
        refundedCurrency: refundCurrency,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders
 * Get user orders with filtering
 */
orderRoutes.get('/', async (req, res, next) => {
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
      where.status = status.toUpperCase();
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
          status: o.status.toLowerCase(),
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
