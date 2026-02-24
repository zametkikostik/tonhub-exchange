import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../services/prisma';
import { ApiError, ErrorCodes } from '../types';
import { config } from '../config';
import { getTonClient, parseTonAddress } from '../services/ton';

export const walletRoutes = Router();

// All routes require authentication
walletRoutes.use(authMiddleware);

const createWithdrawalSchema = z.object({
  currency: z.string().min(1),
  amount: z.string().min(1),
  address: z.string().min(1),
  memo: z.string().optional(),
});

const whitelistAddressSchema = z.object({
  address: z.string().min(1),
  label: z.string().optional(),
});

/**
 * POST /api/wallet/deposit/address
 * Get deposit address for user
 */
walletRoutes.post('/deposit/address', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;

    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        depositAddress: true,
      },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    // Return existing address or create new one
    if (user.depositAddress) {
      res.json({
        success: true,
        data: {
          address: user.depositAddress.address,
          memo: user.depositAddress.memo ?? undefined,
        },
      });
      return;
    }

    // Generate new deposit address
    // In production, this would create a real TON wallet or use a custodial solution
    const client = getTonClient();
    
    // For now, generate a deterministic address based on user ID
    // This is a simplified approach - in production you'd use proper wallet generation
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(`deposit-${user.id}`).digest('hex');
    const address = `EQ${hash.substring(0, 44)}`;
    const memo = user.id.toString();

    const depositAddress = await prisma.depositAddress.create({
      data: {
        userId: user.id,
        address,
        memo,
      },
    });

    res.json({
      success: true,
      data: {
        address: depositAddress.address,
        memo: depositAddress.memo ?? undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/withdraw
 * Create withdrawal request
 */
walletRoutes.post('/withdraw', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const body = createWithdrawalSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        balances: true,
        withdrawalWhitelist: true,
      },
    });

    if (!user) {
      throw new ApiError(
        ErrorCodes.USER_NOT_FOUND,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    // Check if address is whitelisted (for security)
    const normalizedAddress = parseTonAddress(body.address);
    const isWhitelisted = user.withdrawalWhitelist.some(
      (w) => parseTonAddress(w.address) === normalizedAddress
    );

    if (!isWhitelisted && config.nodeEnv === 'production') {
      throw new ApiError(
        ErrorCodes.ADDRESS_NOT_WHITELISTED,
        StatusCodes.BAD_REQUEST,
        'Withdrawal address must be whitelisted first'
      );
    }

    // Check balance
    const balance = user.balances.find((b) => b.currency === body.currency);
    const amount = parseFloat(body.amount);

    if (!balance || parseFloat(balance.available.toString()) < amount) {
      throw new ApiError(
        ErrorCodes.INSUFFICIENT_BALANCE,
        StatusCodes.BAD_REQUEST,
        `Insufficient ${body.currency} balance`
      );
    }

    // Check daily withdrawal limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWithdrawals = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        createdAt: { gte: today },
        currency: body.currency,
      },
      _sum: {
        amount: true,
      },
    });

    const todayTotal = (todayWithdrawals._sum.amount ?? 0) as number;
    const dailyLimit = config.dailyWithdrawalLimit;

    if (todayTotal + amount > dailyLimit) {
      throw new ApiError(
        ErrorCodes.WITHDRAWAL_LIMIT_EXCEEDED,
        StatusCodes.BAD_REQUEST,
        `Daily withdrawal limit exceeded. Limit: ${dailyLimit} ${body.currency}, Used: ${todayTotal}, Requested: ${amount}`
      );
    }

    // Calculate fee
    const fee = amount * 0.001; // 0.1% withdrawal fee
    const totalAmount = amount + fee;

    // Check if user has enough for fee
    if (parseFloat(balance.available.toString()) < totalAmount) {
      throw new ApiError(
        ErrorCodes.INSUFFICIENT_BALANCE,
        StatusCodes.BAD_REQUEST,
        `Insufficient balance to cover amount and fee`
      );
    }

    // Create transaction and deduct balance
    const transaction = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          currency: body.currency,
          amount: amount.toString(),
          fee: fee.toString(),
          toAddress: body.address,
          memo: body.memo,
          requiredConfirmations: 1,
        },
      }),
      prisma.balance.update({
        where: {
          userId_currency: {
            userId: user.id,
            currency: body.currency,
          },
        },
        data: {
          available: {
            decrement: totalAmount.toString(),
          },
        },
      }),
    ]);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        txId: transaction[0].txId,
        status: 'pending',
        currency: body.currency,
        amount: amount.toString(),
        fee: fee.toString(),
        address: body.address,
        memo: body.memo,
        createdAt: transaction[0].createdAt.toISOString(),
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
 * GET /api/wallet/whitelist
 * Get whitelisted addresses
 */
walletRoutes.get('/whitelist', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;

    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        withdrawalWhitelist: {
          orderBy: { createdAt: 'desc' },
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
        addresses: user.withdrawalWhitelist.map((w) => ({
          id: w.id.toString(),
          address: w.address,
          label: w.label,
          isVerified: w.isVerified,
          createdAt: w.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wallet/whitelist
 * Add address to whitelist
 */
walletRoutes.post('/whitelist', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const body = whitelistAddressSchema.parse(req.body);

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

    const normalizedAddress = parseTonAddress(body.address);

    // Check if already exists
    const existing = await prisma.withdrawalWhitelist.findFirst({
      where: {
        userId: user.id,
        address: { equals: body.address, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ApiError(
        ErrorCodes.INVALID_INPUT,
        StatusCodes.BAD_REQUEST,
        'Address already in whitelist'
      );
    }

    const whitelist = await prisma.withdrawalWhitelist.create({
      data: {
        userId: user.id,
        address: body.address,
        label: body.label,
        isVerified: false, // Requires verification in production
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        id: whitelist.id.toString(),
        address: whitelist.address,
        label: whitelist.label,
        isVerified: whitelist.isVerified,
        createdAt: whitelist.createdAt.toISOString(),
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
 * DELETE /api/wallet/whitelist/:id
 * Remove address from whitelist
 */
walletRoutes.delete('/whitelist/:id', async (req, res, next) => {
  try {
    const telegramId = req.user!.telegramId;
    const { id } = req.params;

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

    const whitelist = await prisma.withdrawalWhitelist.findFirst({
      where: {
        id: BigInt(id),
        userId: user.id,
      },
    });

    if (!whitelist) {
      throw new ApiError(
        ErrorCodes.INVALID_INPUT,
        StatusCodes.NOT_FOUND,
        'Whitelist entry not found'
      );
    }

    await prisma.withdrawalWhitelist.delete({
      where: { id: whitelist.id },
    });

    res.json({
      success: true,
      data: { message: 'Address removed from whitelist' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/wallet/history
 * Get transaction history
 */
walletRoutes.get('/history', async (req, res, next) => {
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
