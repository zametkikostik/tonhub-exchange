import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { orderRoutes } from './routes/order.routes';
import { tradeRoutes } from './routes/trade.routes';
import { walletRoutes } from './routes/wallet.routes';
import { initWebSocket } from './websocket';
import { initRedis } from './services/redis';
import { initTON } from './services/ton';
import { startDepositWatcher } from './services/depositWatcher';
import { startOrderMatching } from './services/orderMatching';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/wallet', walletRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Initialize services
async function bootstrap() {
  logger.info('🚀 Starting TonHub Exchange Backend...');

  // Initialize Redis
  await initRedis();
  logger.info('✅ Redis connected');

  // Initialize TON
  await initTON();
  logger.info('✅ TON initialized');

  // Create HTTP server
  const server = app.listen(config.port, () => {
    logger.info(`✅ Server running on port ${config.port}`);
  });

  // Initialize WebSocket
  initWebSocket(server);
  logger.info('✅ WebSocket initialized');

  // Start background jobs
  startDepositWatcher();
  logger.info('✅ Deposit watcher started');

  startOrderMatching();
  logger.info('✅ Order matching engine started');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
