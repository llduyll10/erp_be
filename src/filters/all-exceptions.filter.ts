import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ERROR_MESSAGES } from '../constants/app.constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message =
        typeof response === 'object'
          ? response
          : { message: response || exception.message };
    } else if (exception instanceof Error) {
      message = {
        message: exception.message,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      ...(typeof message === 'object' ? message : { message }),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
} 