// ============================================
// USER TYPES
// ============================================

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

export interface UserBalances {
  balances: UserBalance[];
}

// ============================================
// ORDER TYPES
// ============================================

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

export interface CreateOrderRequest {
  pair: string;
  side: OrderSide;
  type: OrderType;
  price?: string;
  quantity: string;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBook {
  pair: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

// ============================================
// TRADE TYPES
// ============================================

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

export interface RecentTrade {
  id: string;
  price: string;
  quantity: string;
  side: OrderSide;
  timestamp: number;
}

// ============================================
// TRANSACTION TYPES
// ============================================

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

export interface CreateWithdrawalRequest {
  currency: string;
  amount: string;
  address: string;
  memo?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
}

export interface AuthRequest {
  initData: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// WEBSOCKET TYPES
// ============================================

export interface WebSocketMessage {
  action: 'subscribe' | 'unsubscribe' | 'ping';
  channel: string;
  params?: Record<string, string>;
}

export interface WebSocketOrderBookUpdate {
  channel: 'orderbook';
  data: OrderBook;
}

export interface WebSocketTradeUpdate {
  channel: 'trades';
  data: {
    pair: string;
    trades: RecentTrade[];
  };
}

export interface WebSocketOrderUpdate {
  channel: 'orders';
  data: Order;
}

export interface WebSocketBalanceUpdate {
  channel: 'balances';
  data: UserBalances;
}

// ============================================
// TON TYPES
// ============================================

export interface TonTransaction {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  memo?: string;
  timestamp: number;
  confirmations: number;
}

export interface DepositAddress {
  address: string;
  memo?: string;
}

// ============================================
// ERROR TYPES
// ============================================

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
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TELEGRAM_DATA: 'INVALID_TELEGRAM_DATA',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Order errors
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_ALREADY_FILLED: 'ORDER_ALREADY_FILLED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_ORDER_PAIR: 'INVALID_ORDER_PAIR',
  
  // Transaction errors
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  WITHDRAWAL_LIMIT_EXCEEDED: 'WITHDRAWAL_LIMIT_EXCEEDED',
  ADDRESS_NOT_WHITELISTED: 'ADDRESS_NOT_WHITELISTED',
  
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
