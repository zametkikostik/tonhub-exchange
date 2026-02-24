import { createHmac } from 'crypto';
import { ApiError, ErrorCodes } from '@tonhub/shared';
import { StatusCodes } from 'http-status-codes';
import { config } from '../config';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface ValidatedInitData {
  user: TelegramUser;
  queryId?: string;
  authDate: Date;
}

export function validateTelegramInitData(initData: string): ValidatedInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  
  if (!hash) {
    throw new ApiError(
      ErrorCodes.INVALID_TELEGRAM_DATA,
      StatusCodes.BAD_REQUEST,
      'No hash provided'
    );
  }

  // Remove hash from params
  params.delete('hash');

  // Sort params alphabetically
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Create data check string
  const dataCheckString = sortedParams;

  // Create secret key
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(config.telegramBotToken)
    .digest();

  // Calculate hash
  const calculatedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Verify hash
  if (calculatedHash !== hash) {
    throw new ApiError(
      ErrorCodes.INVALID_TELEGRAM_DATA,
      StatusCodes.BAD_REQUEST,
      'Invalid Telegram initData signature'
    );
  }

  // Check if data is not older than 5 minutes
  const authDate = new Date(Number(params.get('auth_date')) * 1000);
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  if (authDate < fiveMinutesAgo) {
    throw new ApiError(
      ErrorCodes.INVALID_TELEGRAM_DATA,
      StatusCodes.BAD_REQUEST,
      'InitData is too old'
    );
  }

  // Parse user data
  const userParam = params.get('user');
  if (!userParam) {
    throw new ApiError(
      ErrorCodes.INVALID_TELEGRAM_DATA,
      StatusCodes.BAD_REQUEST,
      'No user data provided'
    );
  }

  const user: TelegramUser = JSON.parse(decodeURIComponent(userParam));

  return {
    user,
    queryId: params.get('query_id') || undefined,
    authDate,
  };
}
