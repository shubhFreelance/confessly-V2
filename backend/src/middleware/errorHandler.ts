import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError as AppValidationError } from '../utils/errors';
import { ValidationError as ExpressValidationError } from 'express-validator';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err instanceof AppValidationError && { errors: (err as AppValidationError).errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(422).json({
      status: 'fail',
      message: 'Validation Error',
      errors
    });
  }

  // Handle mongoose duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    return res.status(409).json({
      status: 'fail',
      message: 'Duplicate field value entered'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Token expired'
    });
  }

  // Handle express-validator errors
  if (Array.isArray(err) && err[0] instanceof ExpressValidationError) {
    const errors = err.map(e => ({
      field: e.param,
      message: e.msg
    }));
    return res.status(422).json({
      status: 'fail',
      message: 'Validation Error',
      errors
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Send generic error response
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 