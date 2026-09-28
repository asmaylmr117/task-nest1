import type { JwtSignOptions } from '@nestjs/jwt';

export const AUTH_CONSTANTS = {
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  ACCESS_TOKEN_EXPIRATION: (process.env.JWT_ACCESS_EXPIRATION || '15m') as NonNullable<JwtSignOptions['expiresIn']>,
  REFRESH_TOKEN_EXPIRATION: (process.env.JWT_REFRESH_EXPIRATION || '7d') as NonNullable<JwtSignOptions['expiresIn']>,
  BCRYPT_SALT_ROUNDS: 10,
} as const;
