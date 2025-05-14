export enum NODE_ENV {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

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
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 20;




export enum OAUTH_GRANT_TYPE {
  PASSWORD = 'password',
  REFRESH_TOKEN = 'refresh_token',
}

export enum AUTH_STRATEGY {
  TOKEN = 'token',
  REFRESH_TOKEN = 'refresh_token',
}


export enum DEFAULT_ACTIONS {
  FILTER = 'filter',
  SHOW = 'show',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export const COOKIES_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

export const DIGIT_ONLY_REGEX = /^\d+$/;
export const DIGIT_WITH_HYPHEN_REGEX = /^[\d-]+$/;
export const DIGIT_OR_EMPTY_STRING_REGEX = /^(?:[0-9]*)$/;
export const DIGIT_WITH_HYPHEN_OR_EMPTY_STRING_REGEX = /^[\d-]*$/;
export const REGEX_POSTAL_CODE_NUMBER_ONLY = /^\d{7}$/;
export const POSTAL_CODE_REGEX = /^[0-9-]{7,8}$/;
export const REGEX_POSTAL_CODE_OR_EMPTY = /^$|^[\d-]{7,8}$/;

export const PROJECT_QUEUE = 'PROJECT_QUEUE';
export const NOTIFICATION_QUEUE = 'notification';

export const GLOBAL_TAX_RATE = 10; // Default 10%

export const SEARCH_NEAREST_SUPPLIER_RADIUS = 50; // in kilometers

export const ERROR_CODES = {
  VALIDATION: 'E0001',
  INVALID_TOKEN: 'E0002',
  INVALID_CREDENTIALS: 'E0003',
  INVALID_ACCOUNT: 'E0004',
  FORBIDDEN: 'E0005',
  INTERNAL_SERVER_ERROR: 'E0006',
  NOT_FOUND: 'E0007',
};

export const MAX_LENGTH_TEXT_AREA = 9999;

export const CUSTOM_MODEL_NUMBERS = {
  CUSTOM_PRODUCT: 'CUS_PRO_MO_NUM',
  CUSTOM_CONSTRUCTION: 'CUS_CON_MO_NUM',
};

export enum ChangeTypeEnum {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}
