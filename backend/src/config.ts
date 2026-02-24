import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const configSchema = z.object({
  // Server
  port: z.coerce.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  
  // URLs
  frontendUrl: z.string().url(),
  backendUrl: z.string().url(),
  
  // Telegram
  telegramBotToken: z.string().min(1),
  
  // Database
  databaseUrl: z.string().url(),
  
  // Redis
  redisUrl: z.string().url(),
  
  // JWT
  jwtSecret: z.string().min(32),
  jwtRefreshSecret: z.string().min(32),
  jwtExpiresIn: z.string().default('1h'),
  jwtRefreshExpiresIn: z.string().default('7d'),
  
  // TON
  tonNetwork: z.enum(['mainnet', 'testnet']).default('testnet'),
  
  // Trading
  tradingFeePercent: z.coerce.number().default(0.1),
  
  // Withdrawal
  dailyWithdrawalLimit: z.coerce.number().default(10),
  minDepositTon: z.coerce.number().default(0.1),
  
  // Encryption
  encryptionKey: z.string().min(32),
});

const rawConfig = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  tonNetwork: process.env.TON_NETWORK,
  tradingFeePercent: process.env.TRADING_FEE_PERCENT,
  dailyWithdrawalLimit: process.env.DAILY_WITHDRAWAL_LIMIT,
  minDepositTon: process.env.MIN_DEPOSIT_TON,
  encryptionKey: process.env.ENCRYPTION_KEY,
};

const parsedConfig = configSchema.safeParse(rawConfig);

if (!parsedConfig.success) {
  console.error('❌ Invalid configuration:');
  console.error(parsedConfig.error.format());
  process.exit(1);
}

export const config = parsedConfig.data;
