import {
  BullModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) { }
  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: Number(this.configService.get<number>('REDIS_PORT', 6379)),
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    };
  }

  createQueueOptions(queueName: string) {
    return {
      name: queueName,
      redis: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: Number(this.configService.get<number>('REDIS_PORT', 6379)),
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
      },
    };
  }
}
