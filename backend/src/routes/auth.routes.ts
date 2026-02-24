import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validateTelegramInitData } from '../utils/telegram';
import { generateTokens } from '../utils/jwt';
import { prisma } from '../services/prisma';
import { authMiddleware } from '../middleware/authMiddleware';
import { ApiError, ErrorCodes } from '../types';

export const authRoutes = Router();

authRoutes.post('/telegram', async (req, res, next) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      throw new ApiError(
        ErrorCodes.INVALID_INPUT,
        StatusCodes.BAD_REQUEST,
        'initData is required'
      );
    }

    const validatedData = validateTelegramInitData(initData);
    const telegramId = BigInt(validatedData.user.id);

    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          username: validatedData.user.username,
          firstName: validatedData.user.first_name,
          lastName: validatedData.user.last_name,
          languageCode: validatedData.user.language_code || 'en',
          isPremium: validatedData.user.is_premium || false,
        },
      });

      await prisma.balance.createMany({
        data: [
          { userId: user.id, currency: 'TON' },
          { userId: user.id, currency: 'USDT' },
          { userId: user.id, currency: 'BTC' },
        ],
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: validatedData.user.username,
          firstName: validatedData.user.first_name,
          lastName: validatedData.user.last_name,
          languageCode: validatedData.user.language_code || 'en',
          isPremium: validatedData.user.is_premium || false,
        },
      });
    }

    const tokens = generateTokens({
      userId: user.id.toString(),
      telegramId: user.telegramId.toString(),
    });

    res.json({
      success: true,
      data: {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id.toString(),
          telegramId: user.telegramId.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          languageCode: user.languageCode,
          isPremium: user.isPremium,
          tonWalletAddress: user.tonWalletAddress,
          referralCode: user.referralCode,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(
        ErrorCodes.INVALID_INPUT,
        StatusCodes.BAD_REQUEST,
        'refreshToken is required'
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new ApiError(
        ErrorCodes.TOKEN_EXPIRED,
        StatusCodes.UNAUTHORIZED,
        'Invalid or expired refresh token'
      );
    }

    const tokens = generateTokens({
      userId: session.user.id.toString(),
      telegramId: session.user.telegramId.toString(),
    });

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: tokens.refreshToken },
    });

    res.json({
      success: true,
      data: {
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const telegramId = BigInt(req.user!.telegramId);

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

    res.json({
      success: true,
      data: {
        id: user.id.toString(),
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
        isPremium: user.isPremium,
        tonWalletAddress: user.tonWalletAddress,
        referralCode: user.referralCode,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});
