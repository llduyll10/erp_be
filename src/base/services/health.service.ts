import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from './redis.service';

@Injectable()
export class HealthService {
  constructor(
    private dataSource: DataSource,
    private redisService: RedisService,
  ) {}

  async checkHealth(): Promise<{
    status: string;
    details: Record<string, any>;
  }> {
    const details: Record<string, any> = {};
    let isHealthy = true;

    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');
      details.database = { status: 'up' };
    } catch (error) {
      details.database = { status: 'down', error: error.message };
      isHealthy = false;
    }

    try {
      // Check Redis connection
      await this.redisService.ping();
      details.redis = { status: 'up' };
    } catch (error) {
      details.redis = { status: 'down', error: error.message };
      isHealthy = false;
    }

    // Add memory usage
    const memoryUsage = process.memoryUsage();
    details.memory = {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
    };

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details,
    };
  }
} 