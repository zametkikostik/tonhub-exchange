import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger';
import { ApiError } from '../types';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // API Error (known error)
  if (err instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };

    if (process.env.NODE_ENV === 'development') {
      response.error.stack = err.stack;
    }

    res.status(err.status).json(response);
    return;
  }

  // Unknown error - Internal Server Error
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  };

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const err = new ApiError(
    'NOT_FOUND',
    StatusCodes.NOT_FOUND,
    `Route ${req.method} ${req.path} not found`
  );
  next(err);
}
