import { HttpStatus } from '@nestjs/common';
import { ApiError } from './api-error.util';
import { QueryFailedError } from 'typeorm';

export class DatabaseError extends ApiError {
  constructor(error: any) {
    const { message, code, details } = DatabaseError.parseError(error);
    super(message, HttpStatus.BAD_REQUEST, code, details);
  }

  private static parseError(error: any): {
    message: string;
    code: string;
    details?: any;
  } {
    if (error instanceof QueryFailedError) {
      // Handle specific PostgreSQL errors
      switch (error.driverError.code) {
        case '23505': // unique_violation
          return {
            message: 'Duplicate entry',
            code: 'UNIQUE_VIOLATION',
            details: {
              constraint: error.driverError.constraint,
            },
          };
        case '23503': // foreign_key_violation
          return {
            message: 'Referenced record not found',
            code: 'FOREIGN_KEY_VIOLATION',
            details: {
              constraint: error.driverError.constraint,
            },
          };
        default:
          return {
            message: error.message,
            code: error.driverError.code,
            details: error.driverError,
          };
      }
    }

    return {
      message: error.message || 'Database error',
      code: 'DB_ERROR',
      details: error,
    };
  }
} 