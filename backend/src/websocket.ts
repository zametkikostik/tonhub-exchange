import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { parse as parseUrl } from 'url';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { getRedis, subscribe } from '../services/redis';
import { prisma } from '../services/prisma';

interface Client extends WebSocket {
  userId?: string;
  subscriptions: Set<string>;
  isAlive: boolean;
}

let wss: WebSocketServer | null = null;
const clients = new Map<string, Set<Client>>(); // userId -> clients

export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({
    server,
    path: '/ws',
  });

  wss.on('connection', async (ws: WebSocket, req) => {
    const client = ws as Client;
    client.subscriptions = new Set();
    client.isAlive = true;

    try {
      // Parse token from URL
      const url = parseUrl(req.url || '', true);
      const token = url.query.token as string;

      if (token) {
        const payload = verifyToken(token);
        client.userId = payload.userId;

        // Add to clients map
        if (!clients.has(payload.userId)) {
          clients.set(payload.userId, new Set());
        }
        clients.get(payload.userId)!.add(client);

        logger.info(`WebSocket client connected: ${payload.userId}`);

        // Send welcome message
        client.send(JSON.stringify({
          type: 'connected',
          userId: payload.userId,
        }));
      }

      // Handle messages
      client.on('message', (data) => {
        handleMessage(client, data.toString());
      });

      // Handle pong
      client.on('pong', () => {
        client.isAlive = true;
      });

      // Handle disconnect
      client.on('close', () => {
        if (client.userId) {
          const userClients = clients.get(client.userId);
          if (userClients) {
            userClients.delete(client);
            if (userClients.size === 0) {
              clients.delete(client.userId);
            }
          }
        }
        logger.info('WebSocket client disconnected');
      });

      // Handle error
      client.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });

    } catch (error) {
      logger.error('WebSocket connection error:', error);
      client.close();
    }
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    if (!wss) return;

    wss.clients.forEach((ws) => {
      const client = ws as Client;
      if (!client.isAlive) {
        return ws.terminate();
      }
      client.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  logger.info('WebSocket server initialized');
}

function handleMessage(client: Client, message: string): void {
  try {
    const data = JSON.parse(message);
    const { action, channel, params } = data;

    switch (action) {
      case 'subscribe':
        handleSubscribe(client, channel, params);
        break;
      case 'unsubscribe':
        handleUnsubscribe(client, channel, params);
        break;
      case 'ping':
        client.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
      default:
        client.send(JSON.stringify({
          type: 'error',
          message: `Unknown action: ${action}`,
        }));
    }
  } catch (error) {
    logger.error('WebSocket message error:', error);
    client.send(JSON.stringify({
      type: 'error',
      message: 'Invalid message format',
    }));
  }
}

function handleSubscribe(
  client: Client,
  channel: string,
  params?: Record<string, string>
): void {
  if (!client.userId) {
    client.send(JSON.stringify({
      type: 'error',
      message: 'Authentication required',
    }));
    return;
  }

  const subscriptionKey = params?.pair
    ? `${channel}:${params.pair}`
    : channel;

  client.subscriptions.add(subscriptionKey);

  logger.info(`Client ${client.userId} subscribed to ${subscriptionKey}`);

  // Send initial data for some channels
  if (channel === 'orderbook' && params?.pair) {
    sendOrderBook(client, params.pair);
  }
}

function handleUnsubscribe(
  client: Client,
  channel: string,
  params?: Record<string, string>
): void {
  const subscriptionKey = params?.pair
    ? `${channel}:${params.pair}`
    : channel;

  client.subscriptions.delete(subscriptionKey);
  logger.info(`Client ${client.userId} unsubscribed from ${subscriptionKey}`);
}

async function sendOrderBook(client: Client, pair: string): Promise<void> {
  try {
    const depth = 20;

    const [bids, asks] = await Promise.all([
      prisma.order.findMany({
        where: { pair, side: 'BUY', status: 'PENDING' },
        orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
        take: depth,
        select: { price: true, quantity: true, filledQuantity: true },
      }),
      prisma.order.findMany({
        where: { pair, side: 'SELL', status: 'PENDING' },
        orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
        take: depth,
        select: { price: true, quantity: true, filledQuantity: true },
      }),
    ]);

    const aggregateOrders = (orders: any[]) => {
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

    client.send(JSON.stringify({
      channel: 'orderbook',
      data: {
        pair,
        bids: aggregateOrders(bids),
        asks: aggregateOrders(asks),
        timestamp: Date.now(),
      },
    }));
  } catch (error) {
    logger.error('Error sending orderbook:', error);
  }
}

// Broadcast functions
export function broadcastToUser(userId: string, message: object): void {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const data = JSON.stringify(message);
  userClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export function broadcastToChannel(channel: string, pair: string, data: object): void {
  const message = JSON.stringify({ channel, data });
  
  clients.forEach((userClients) => {
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN &&
          client.subscriptions.has(`${channel}:${pair}`)) {
        client.send(message);
      }
    });
  });
}

export function broadcastOrderUpdate(userId: string, order: object): void {
  broadcastToUser(userId, {
    channel: 'orders',
    data: order,
  });
}

export function broadcastBalanceUpdate(userId: string, balances: object): void {
  broadcastToUser(userId, {
    channel: 'balances',
    data: balances,
  });
}
