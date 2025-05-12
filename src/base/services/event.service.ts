import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventService {
  constructor(private eventEmitter: EventEmitter2) {}

  async emit(event: string, payload: any): Promise<void> {
    this.eventEmitter.emit(event, payload);
  }

  async emitAsync(event: string, payload: any): Promise<any[]> {
    return this.eventEmitter.emitAsync(event, payload);
  }

  onEvent(event: string, callback: (payload: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  onceEvent(event: string, callback: (payload: any) => void): void {
    this.eventEmitter.once(event, callback);
  }

  removeListener(event: string, callback: (payload: any) => void): void {
    this.eventEmitter.removeListener(event, callback);
  }
} 