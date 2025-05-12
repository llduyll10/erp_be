import {
  Brackets,
  Repository,
  DeepPartial,
  ObjectLiteral,
  SelectQueryBuilder,
  WhereExpressionBuilder,
  QueryRunner,
  BaseEntity,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

// Constants
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;

type ClassType<T> = {
  new (...args: unknown[]): T;
};

export enum QueryOperators {
  START_WITH = 'START_WITH',
  END_WITH = 'END_WITH',
  CONTAINS = 'CONTAINS',
  CONTAIN = 'CONTAIN',
  LIKE = 'LIKE',
  NOT_EQUAL = 'NOT_EQUAL',
  EQUAL = 'EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  GREATER_OR_EQUAL_THAN = 'GREATER_OR_EQUAL_THAN',
  LESS_OR_EQUAL_THAN = 'LESS_OR_EQUAL_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  BETWEEN = 'BETWEEN',
}

export enum QueryWhereType {
  WHERE = 'WHERE',
  WHERE_AND = 'WHERE_AND',
  WHERE_OR = 'WHERE_OR',
}

export enum QueryOrderDir {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type CondtionItem = {
  whereType: QueryWhereType;
  column?: string;
  value?: unknown;
  operator?: QueryOperators;
  paramName?: string;
  conditions?: QueryCondition[];
  builder?: ConditionFunction;
};

export type ConditionFunction = (
  value: WhereExpressionBuilder,
) => WhereExpressionBuilder;

export type QueryCondition = CondtionItem | ConditionFunction;

export type QueryPagination = {
  page: number;
  limit: number;
};

export type QueryOrder = {
  orderBy: string;
  orderDir: QueryOrderDir;
};

export type QueryRelation = {
  column: string;
  alias: string;
  order?: QueryOrder;
  joinType?: 'left' | 'inner' | 'count';
  joinCondition?: CondtionItem;
};

/* eslint-disable complexity */
export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  protected get alias(): string {
    return this.metadata.tableName;
  }

  protected get primaryFields(): string[] {
    return this.metadata.primaryColumns.map((column) => column.propertyName);
  }

  protected get entityType(): ClassType<T> {
    return this.target as ClassType<T>;
  }

  protected _buildConditionQuery(
    queryBuilder: WhereExpressionBuilder,
    conditions: QueryCondition[],
  ): void {
    // Implementation here
  }

  protected _buildRelationQuery(
    queryBuilder: SelectQueryBuilder<T>,
    relations: QueryRelation[],
  ): void {
    // Implementation here
  }

  protected _parseColumnName(name: string): string {
    return name.includes('.') ? name : `${this.alias}.${name}`;
  }

  protected _getTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  public async findMany(
    params: {
      conditions?: QueryCondition[];
      relations?: QueryRelation[];
      pagination?: QueryPagination;
      orders?: QueryOrder[];
    },
    queryRunner?: QueryRunner,
  ): Promise<[T[], number, number]> {
    const { conditions = [], relations = [], pagination, orders } = params;

    const queryBuilder = this.createQueryBuilder(this.alias, queryRunner);

    if (conditions.length > 0) {
      this._buildConditionQuery(queryBuilder, conditions);
    }

    if (relations.length > 0) {
      this._buildRelationQuery(queryBuilder, relations);
    }

    queryBuilder.skip(
      ((pagination?.page || DEFAULT_PAGE_NUMBER) - 1) *
        (pagination?.limit || DEFAULT_PAGE_SIZE),
    );
    queryBuilder.take(pagination?.limit || DEFAULT_PAGE_SIZE);

    if (orders) {
      orders.forEach((order, index) => {
        if (index === 0) {
          queryBuilder.orderBy(
            `${this._parseColumnName(order.orderBy)}`,
            order.orderDir,
          );
        } else {
          queryBuilder.addOrderBy(
            `${this._parseColumnName(order.orderBy)}`,
            order.orderDir,
          );
        }
      });
    }

    const [records, total] = await queryBuilder.getManyAndCount();

    const totalPage = this._getTotalPages(
      total,
      pagination?.limit || DEFAULT_PAGE_SIZE,
    );

    return [records, total, totalPage];
  }

  // ... rest of the methods ...
} 