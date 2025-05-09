import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Admin access required' });
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate as admin' });
  }
};

export const authorize = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};

export const require2FA = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.is2FAEnabled) {
    return next();
  }

  const { twoFactorToken } = req.body;
  if (!twoFactorToken) {
    return res.status(400).json({ message: '2FA token required' });
  }

  // TODO: Implement 2FA verification
  next();
};

export const rateLimit = (limit: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();

    if (requests.has(key)) {
      const request = requests.get(key)!;
      if (now > request.resetTime) {
        request.count = 1;
        request.resetTime = now + windowMs;
      } else if (request.count >= limit) {
        return next(new ForbiddenError('Too many requests'));
      } else {
        request.count++;
      }
    } else {
      requests.set(key, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
}; 