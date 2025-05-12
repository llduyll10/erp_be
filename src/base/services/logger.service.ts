import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: string, context?: string) {
    this.logger.log({ msg: message, context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ msg: message, trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn({ msg: message, context });
  }

  debug(message: string, context?: string) {
    this.logger.debug({ msg: message, context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose({ msg: message, context });
  }
} 