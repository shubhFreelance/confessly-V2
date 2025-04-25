import { createClient, RedisClientType } from 'redis';
import { logger } from '../config/logger';

export class CacheService {
  private static client: RedisClientType;
  private static isConnected = false;

  static async initialize() {
    if (this.isConnected) return;

    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retries reached');
            return new Error('Redis max retries reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
      this.isConnected = true;
    });

    this.client.on('error', (error: Error) => {
      logger.error('Redis error:', error);
      this.isConnected = false;
    });

    await this.client.connect();
  }

  static async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      throw error;
    }
  }

  static async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis del error:', error);
      throw error;
    }
  }

  static async flush(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      logger.error('Redis flush error:', error);
      throw error;
    }
  }
} 