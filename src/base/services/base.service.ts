import { Repository, DeepPartial, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { CommonQueryDTO } from '../dtos/common-query.dto';

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(query: CommonQueryDTO): Promise<[T[], number]> {
    const { page = 1, limit = 10, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const order: Record<string, 'ASC' | 'DESC'> = sortBy 
      ? { [sortBy]: sortOrder || 'ASC' }
      : {};

    const [items, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: order as FindOptionsOrder<T>,
    });

    return [items, total];
  }

  async findOne(id: string): Promise<T> {
    const item = await this.repository.findOne({ 
      where: { id } as FindOptionsWhere<T>
    });
    
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    
    return item;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const item = this.repository.create(data);
    return await this.repository.save(item);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    await this.findOne(id);
    await this.repository.update(id, data as any);
    return await this.findOne(id);
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
  }
} 