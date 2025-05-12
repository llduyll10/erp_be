import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('default') private readonly defaultQueue: Queue,
  ) {}

  async addJob<T>(
    name: string,
    data: T,
    options?: {
      delay?: number;
      priority?: number;
      attempts?: number;
    },
  ): Promise<void> {
    await this.defaultQueue.add(name, data, {
      removeOnComplete: true,
      ...options,
    });
  }

  async getJob(jobId: string) {
    return await this.defaultQueue.getJob(jobId);
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  async clearQueue(): Promise<void> {
    await this.defaultQueue.empty();
  }
} 