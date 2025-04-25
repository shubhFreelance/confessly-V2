import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cacheService';

export const cache = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await CacheService.get(key);
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json
      res.json = function(body: any) {
        // Store in cache
        CacheService.set(key, JSON.stringify(body), ttl);
        // Call original res.json
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const clearCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CacheService.del(`cache:${pattern}`);
      next();
    } catch (error) {
      next(error);
    }
  };
}; 