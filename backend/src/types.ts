// Backend-specific types (no dependency on @tonhub/shared)

export interface AuthPayload {
  userId: string;
  telegramId: string;
}

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode: string;
  isPremium: boolean;
  tonWalletAddress?: string;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBalance {
  currency: string;
  available: string;
  locked: string;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'partially_filled' | 'filled' | 'cancelled' | 'rejected';

export interface Order {
  orderId: string;
  userId: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price?: string;
  quantity: string;
  filledQuantity: string;
  total?: string;
  fee: string;
  createdAt: string;
  updatedAt: string;
  filledAt?: string;
  cancelledAt?: string;
}

export interface Trade {
  tradeId: string;
  orderId: string;
  makerOrderId: string;
  pair: string;
  price: string;
  quantity: string;
  fee: string;
  feeCurrency: string;
  isMaker: boolean;
  createdAt: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'referral';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  txId: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  currency: string;
  amount: string;
  fee: string;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  memo?: string;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: string;
  completedAt?: string;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TELEGRAM_DATA: 'INVALID_TELEGRAM_DATA',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_ALREADY_FILLED: 'ORDER_ALREADY_FILLED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_ORDER_PAIR: 'INVALID_ORDER_PAIR',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  WITHDRAWAL_LIMIT_EXCEEDED: 'WITHDRAWAL_LIMIT_EXCEEDED',
  ADDRESS_NOT_WHITELISTED: 'ADDRESS_NOT_WHITELISTED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
