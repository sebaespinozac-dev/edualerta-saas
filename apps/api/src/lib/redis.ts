import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: false,
  maxRetriesPerRequest: 2,
  enableOfflineQueue: true,
});

redis.on('error', (err) => logger.warn({ err }, 'redis error'));
redis.on('connect', () => logger.info('redis connected'));
