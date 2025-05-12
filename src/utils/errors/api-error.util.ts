import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly code?: string,
    public readonly details?: any,
  ) {
    super(
      {
        message,
        status,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }

  static badRequest(message: string, code?: string, details?: any): ApiError {
    return new ApiError(message, HttpStatus.BAD_REQUEST, code, details);
  }

  static unauthorized(message: string, code?: string): ApiError {
    return new ApiError(message, HttpStatus.UNAUTHORIZED, code);
  }

  static forbidden(message: string, code?: string): ApiError {
    return new ApiError(message, HttpStatus.FORBIDDEN, code);
  }

  static notFound(message: string, code?: string): ApiError {
    return new ApiError(message, HttpStatus.NOT_FOUND, code);
  }

  static conflict(message: string, code?: string, details?: any): ApiError {
    return new ApiError(message, HttpStatus.CONFLICT, code, details);
  }

  static internal(message: string, code?: string, details?: any): ApiError {
    return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, code, details);
  }
} 