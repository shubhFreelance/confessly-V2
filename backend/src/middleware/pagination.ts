import { Request, Response, NextFunction } from 'express';

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export const pagination = (options: PaginationOptions = {}) => {
  const defaultLimit = options.defaultLimit || 10;
  const maxLimit = options.maxLimit || 100;

  return (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(
      parseInt(req.query.limit as string) || defaultLimit,
      maxLimit
    );
    const skip = (page - 1) * limit;

    req.pagination = {
      page,
      limit,
      skip
    };

    next();
  };
}; 