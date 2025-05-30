import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    bufferLogs: true,
    cors: true
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);

  // Global prefix
  app.setGlobalPrefix('api');

  // Pipes
  app.useGlobalPipes(new ValidationPipe());

  // Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: configService.get('FRONTEND_DOMAIN', '*'),
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('NestJS API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);



  await app.listen(port);
  app.flushLogs();
}
bootstrap(); 