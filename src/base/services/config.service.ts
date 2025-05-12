import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T>(key: string, defaultValue?: T): T {
    const value = this.configService.get<T>(key);
    return value !== undefined ? value : (defaultValue as T);
  }

  getNumber(key: string, defaultValue = 0): number {
    const value = this.get<string | number | undefined>(key);
    return value !== undefined ? Number(value) : defaultValue;
  }

  getBoolean(key: string, defaultValue = false): boolean {
    const value = this.get<string | undefined>(key);
    return value !== undefined ? value.toLowerCase() === 'true' : defaultValue;
  }

  getString(key: string, defaultValue = ''): string {
    return this.get<string>(key, defaultValue);
  }

  getRequired<T>(key: string): T {
    const value = this.get<T | undefined>(key);
    if (value === undefined) {
      throw new Error(`Required config key "${key}" is missing`);
    }
    return value;
  }

  has(key: string): boolean {
    return this.configService.get(key) !== undefined;
  }
} 