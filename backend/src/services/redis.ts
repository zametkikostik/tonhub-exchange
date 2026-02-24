import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export async function initRedis(): Promise<void> {
  redisClient = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 50, 2000);
    },
  });

  redisClient.on('error', (error) => {
    logger.error('Redis error:', error);
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  await redisClient.ping();
}

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis not initialized');
  }
  return redisClient;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  const redis = getRedis();
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function deleteCache(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export async function publish(channel: string, message: string): Promise<void> {
  const redis = getRedis();
  await redis.publish(channel, message);
}

export async function subscribe(channel: string, callback: (message: string) => void): Promise<void> {
  const redis = getRedis();
  await redis.subscribe(channel);
  redis.on('message', (ch, message) => {
    if (ch === channel) {
      callback(message);
    }
  });
}
