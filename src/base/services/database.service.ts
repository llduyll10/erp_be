import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { DatabaseError } from '../../utils/errors/database-error.util';

@Injectable()
export class DatabaseService {
  constructor(private dataSource: DataSource) {}

  async transaction<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new DatabaseError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async executeInTransaction<T>(
    callback: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (entityManager) => {
      try {
        return await callback(entityManager);
      } catch (error) {
        throw new DatabaseError(error);
      }
    });
  }

  async bulkInsert<T>(
    entity: any,
    data: T[],
    chunkSize: number = 1000,
  ): Promise<void> {
    try {
      const chunks = this.chunkArray(data, chunkSize);
      for (const chunk of chunks) {
        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into(entity)
          .values(chunk)
          .execute();
      }
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
} 