import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';

export const REFRESH_COOKIE_NAME = 'jid';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      roles: user.roles,
      jti: crypto.randomUUID(), // Unique token ID
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      jti: crypto.randomUUID(), // Unique token ID
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

export const getRefreshCookieOptions = () => {
  const isProduction = config.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  };
};

export const createAndSaveRefreshToken = async (user, req) => {
  const token = generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
  const userAgent = req?.headers?.['user-agent'] || '';

  await RefreshToken.create({
    userId: user._id || user.id,
    token,
    expiresAt,
    ipAddress,
    userAgent,
  });

  return token;
};
