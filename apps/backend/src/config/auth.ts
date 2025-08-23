export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];