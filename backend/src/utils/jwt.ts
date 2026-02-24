import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthPayload {
  userId: string;
  telegramId: string;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export function generateTokens(payload: AuthPayload): TokenPair {
  const token = jwt.sign(payload, config.jwtSecret);
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret);

  return {
    token,
    refreshToken,
    expiresIn: 3600,
  };
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwtSecret) as AuthPayload;
}

export function verifyRefreshToken(refreshToken: string): AuthPayload {
  return jwt.verify(refreshToken, config.jwtRefreshSecret) as AuthPayload;
}
