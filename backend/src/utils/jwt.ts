import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { AuthPayload } from '../middleware/authMiddleware';

export interface TokenPair {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export function generateTokens(payload: AuthPayload): TokenPair {
  const expiresIn = parseExpiration(config.jwtExpiresIn);
  
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });

  return {
    token,
    refreshToken,
    expiresIn,
  };
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwtSecret) as AuthPayload;
}

export function verifyRefreshToken(refreshToken: string): AuthPayload {
  return jwt.verify(refreshToken, config.jwtRefreshSecret) as AuthPayload;
}

function parseExpiration(expiration: string): number {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) return 3600;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 3600;
  }
}
