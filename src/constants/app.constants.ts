export const APP_CONSTANTS = {
  DEFAULT_PORT: 3000,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_LANGUAGE: 'en',
  JWT_EXPIRES_IN: '1d',
  JWT_REFRESH_EXPIRES_IN: '7d',
  PASSWORD_SALT_ROUNDS: 10,
  CACHE_TTL: 60, // seconds
  RATE_LIMIT_TTL: 60, // seconds
  RATE_LIMIT_MAX: 100,
  FILE_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

export const VALIDATION_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 32,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
}; 

export const MAX_LENGTH_INPUT = 255;