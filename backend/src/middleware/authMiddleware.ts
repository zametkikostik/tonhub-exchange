import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { config } from '../config';
import { ApiError, ErrorCodes } from '@tonhub/shared';

export interface AuthPayload {
  userId: string;
  telegramId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        ErrorCodes.UNAUTHORIZED,
        StatusCodes.UNAUTHORIZED,
        'No token provided'
      );
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(
        ErrorCodes.TOKEN_EXPIRED,
        StatusCodes.UNAUTHORIZED,
        'Token expired'
      ));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(
        ErrorCodes.INVALID_TOKEN,
        StatusCodes.UNAUTHORIZED,
        'Invalid token'
      ));
    } else {
      next(error);
    }
  }
}

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
      req.user = decoded;
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  
  next();
}
