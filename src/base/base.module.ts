import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import appConfig from '../config/app.config';

import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { RedisService } from './services/redis.service';
import { EventService } from './services/event.service';
import { FileService } from './services/file.service';
import { EncryptionService } from './services/encryption.service';
import { ConfigService } from './services/config.service';
import { HealthService } from './services/health.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.getNumber('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('REDIS_HOST'),
        port: configService.getNumber('REDIS_PORT'),
        ttl: 60,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.getNumber('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    DatabaseService,
    CacheService,
    RedisService,
    EventService,
    FileService,
    EncryptionService,
    ConfigService,
    HealthService,
  ],
  exports: [
    DatabaseService,
    CacheService,
    RedisService,
    EventService,
    FileService,
    EncryptionService,
    ConfigService,
    HealthService,
  ],
})
export class BaseModule {} 