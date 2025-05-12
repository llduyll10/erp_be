import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

interface ValidationErrors {
  [key: string]: string[];
}

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const validationErrors = exception.getResponse() as any;

    const errors = validationErrors.message.reduce((acc: ValidationErrors, err: any) => {
      if (err.constraints) {
        acc[err.property] = Object.values(err.constraints);
      }
      return acc;
    }, {});

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: 'Validation failed',
      errors: this.formatErrors(errors),
    });
  }

  private formatErrors(errors: ValidationErrors): object {
    return errors;
  }
} 