import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle validation errors (from express-validator)
  if (Array.isArray(err) && err.length > 0 && err[0].param && err[0].msg) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.map(e => ({
        field: e.param,
        message: e.msg
      }))
    });
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle standard Error instances
  if (err instanceof Error) {
    // Log the error stack in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', err.stack);
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred'
  });
}; 