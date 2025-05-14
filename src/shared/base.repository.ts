import {
  Brackets,
  Repository,
  DeepPartial,
  ObjectLiteral,
  SelectQueryBuilder,
  WhereExpressionBuilder,
  QueryRunner,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/index';

type ClassType<T> = {
  new(...args: unknown[]): T;
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
  paramName?: string; // use for relation condition
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

  public async findMany(
    params: {
      conditions?: QueryCondition[];
      relations?: QueryRelation[];
      pagination?: QueryPagination;
      orders?: QueryOrder[];
    },
    queryRunner?: QueryRunner,
  ): Promise<[T[], number, number]> {
    const { conditions, relations, pagination = { page: DEFAULT_PAGE_NUMBER, limit: DEFAULT_PAGE_SIZE }, orders } = params;

    const queryBuilder = this.createQueryBuilder(this.alias, queryRunner);

    if (conditions && conditions.length > 0) {
      this._buildConditionQuery(queryBuilder, conditions);
    }

    if (relations && relations.length > 0) {
      this._buildRelationQuery(queryBuilder, relations);
    }

    queryBuilder.skip(
      ((pagination.page || DEFAULT_PAGE_NUMBER) - 1) *
      (pagination.limit || DEFAULT_PAGE_SIZE),
    );
    queryBuilder.take(pagination.limit || DEFAULT_PAGE_SIZE);

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
      pagination.limit || DEFAULT_PAGE_SIZE,
    );

    return [records, total, totalPage];
  }

  async getOne(
    params: { conditions?: QueryCondition[]; relations?: QueryRelation[] },
    queryRunner?: QueryRunner,
  ) {
    const { conditions, relations } = params;
    const queryBuilder = this.createQueryBuilder(this.alias, queryRunner);

    if (conditions && conditions.length > 0) {
      this._buildConditionQuery(queryBuilder, conditions);
    }

    if (relations && relations.length > 0) {
      this._buildRelationQuery(queryBuilder, relations);
    }

    const entity = await queryBuilder.getOne();

    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }

  async getRelations(entity: T, options: { relations: QueryRelation[] }) {
    const newConditions: QueryCondition[] = this.primaryFields.map((field) => {
      return {
        column: field,
        value: entity[field as keyof T],
        operator: QueryOperators.EQUAL,
        whereType: QueryWhereType.WHERE_AND,
      };
    });

    return this.getOne({
      conditions: newConditions,
      relations: options.relations,
    });
  }

  async createOne(params: { data: DeepPartial<T> }, queryRunner?: QueryRunner) {
    const { data } = params;

    const entity = plainToInstance(this.entityType, data);

    return queryRunner?.manager
      ? queryRunner?.manager?.save(entity, { transaction: false })
      : this.save(entity);
  }

  async updateOne(
    params: {
      conditions: QueryCondition[];
      data: DeepPartial<T>;
    },
    queryRunner?: QueryRunner,
  ): Promise<T> {
    const { conditions, data } = params;

    const entity = await this.getOne({ conditions }, queryRunner);

    const updateData = this.merge(entity, data);

    return queryRunner?.manager
      ? queryRunner?.manager.save(updateData)
      : this.save(updateData);
  }

  async removeOne(
    params: { conditions: QueryCondition[] },
    queryRunner?: QueryRunner,
  ): Promise<T> {
    const { conditions } = params;

    const entity = await this.getOne({ conditions }, queryRunner);

    return queryRunner?.manager
      ? queryRunner?.manager.remove(entity)
      : this.remove(entity);
  }

  searchWithPattern({
    q,
    against,
    alias,
    associatedAgainst = {},
    numberFields = [],
  }: {
    q: string;
    against?: string[];
    alias: string;
    associatedAgainst?: { [key: string]: string[] | Record<string, string[]> };
    numberFields?: string[];
  }) {
    const queryBuilder = this.createQueryBuilder(alias);

    if (q) {
      const groups = q
        .split(',')
        .map((group) => group.trim())
        .filter((group) => group !== '');

      // Perform partial search on the specified columns
      if (against && against.length > 0) {
        against.forEach((column) => {
          queryBuilder.orWhere(
            new Brackets((qb) => {
              groups.forEach((group, groupIndex) => {
                // Open a new bracket for each group to ensure terms in different groups are connected by OR
                qb.orWhere(
                  new Brackets((groupQb) => {
                    const terms = group
                      .split(' ')
                      .map((term) => term.trim())
                      .filter((term) => term !== '');

                    // If the column is a number field and the term is a number, use exact match
                    if (numberFields.includes(column) && !isNaN(Number(group))) {
                      groupQb.where(`${alias}.${column} = :value`, {
                        value: Number(group),
                      });
                    } else {
                      // Use partial search for each term in the group, connected by AND
                      terms.forEach((term, termIndex) => {
                        const condition = `${alias}.${column} ILIKE :term${groupIndex}_${termIndex}`;
                        const params = {
                          [`term${groupIndex}_${termIndex}`]: `%${term}%`,
                        };
                        // Connect terms within the same group by AND
                        if (termIndex === 0) {
                          groupQb.where(condition, params);
                        } else {
                          groupQb.andWhere(condition, params);
                        }
                      });
                    }
                  }),
                );
              });
            }),
          );
        });
      }

      // Perform search on associated entities
      if (Object.keys(associatedAgainst).length > 0) {
        Object.entries(associatedAgainst).forEach(
          ([association, columnsOrObject]) => {
            queryBuilder.orWhere(
              new Brackets((qb) => {
                groups.forEach((group, groupIndex) => {
                  // Open a new bracket for each group to ensure terms in different groups are connected by OR
                  qb.orWhere(
                    new Brackets((groupQb) => {
                      const terms = group
                        .split(' ')
                        .map((term) => term.trim())
                        .filter((term) => term !== '');

                      if (Array.isArray(columnsOrObject)) {
                        const columns = columnsOrObject;
                        columns.forEach((column) => {
                          terms.forEach((term, termIndex) => {
                            const condition = `${association}.${column} ILIKE :term${groupIndex}_${termIndex}`;
                            const params = {
                              [`term${groupIndex}_${termIndex}`]: `%${term}%`,
                            };
                            // Connect terms within the same group by AND
                            if (termIndex === 0) {
                              groupQb.where(condition, params);
                            } else {
                              groupQb.andWhere(condition, params);
                            }
                          });
                        });
                      } else {
                        Object.entries(columnsOrObject).forEach(
                          ([nestedAssociation, columns]) => {
                            if (Array.isArray(columns)) {
                              columns.forEach((column) => {
                                terms.forEach((term, termIndex) => {
                                  const condition = `${association}.${nestedAssociation}.${column} ILIKE :term${groupIndex}_${termIndex}`;
                                  const params = {
                                    [`term${groupIndex}_${termIndex}`]: `%${term}%`,
                                  };
                                  // Connect terms within the same group by AND
                                  if (termIndex === 0) {
                                    groupQb.where(condition, params);
                                  } else {
                                    groupQb.andWhere(condition, params);
                                  }
                                });
                              });
                            }
                          },
                        );
                      }
                    }),
                  );
                });
              }),
            );
          }
        );
      }
    }
    return queryBuilder;
  }

  private _getTotalPages(totalRecords: number, limit: number) {
    const totalPages = totalRecords / limit;
    const remainder = totalRecords % limit;
    return remainder > 0 ? Math.floor(totalPages) + 1 : totalPages;
  }

  private _buildConditionQuery(
    queryBuilder: WhereExpressionBuilder,
    conditions: QueryCondition[] = [],
  ) {
    conditions.forEach((condition, index) => {
      if (typeof condition === 'function') {
        return condition(queryBuilder);
      }

      const {
        whereType,
        column,
        value,
        operator,
        builder,
        conditions: childConditions,
      } = condition;

      if (builder) {
        return this._buildWhereType(queryBuilder, {
          whereType,
          where: builder,
        });
      }
      if (childConditions) {
        return this._buildWhereType(queryBuilder, {
          whereType,
          where: new Brackets((qb) => {
            this._buildConditionQuery(qb, childConditions);
          }),
        });
      }

      let statement;
      let params;
      if (value === undefined || value === null || !column) return;

      const columnName = this._parseColumnName(column);
      const paramName = this._parseParamName(column) || '';
      if (
        Array.isArray(value) &&
        operator &&
        [QueryOperators.IN, QueryOperators.NOT_IN].includes(operator)
      ) {
        statement = [
          columnName,
          this._parseOperator(operator),
          `(${this._toBindingArray(paramName)})`,
        ];
        params = { [paramName]: value };
      } else if (
        Array.isArray(value) &&
        operator &&
        [QueryOperators.BETWEEN].includes(operator)
      ) {
        const fromParamKey = `${paramName}_${index}_from`;
        const toParamKey = `${paramName}_${index}_to`;
        statement = [
          columnName,
          this._parseOperator(operator),
          this._toBindingVariable(fromParamKey),
          'AND',
          this._toBindingVariable(toParamKey),
        ];
        params = {
          [fromParamKey]: value[0],
          [toParamKey]: value[1],
        };
      } else {
        statement = [
          columnName,
          this._parseOperator(operator),
          this._toBindingVariable(paramName),
        ];
        params = {
          [paramName]: this._parseParameter(value, operator),
        };
      }

      return this._buildWhereType(queryBuilder, {
        whereType,
        where: statement.join(' '),
        params,
      });
    });
  }

  private _buildWhereType(
    queryBuilder: WhereExpressionBuilder,
    options: {
      whereType: QueryWhereType;
      where?:
      | string
      | Brackets
      | ((qb: WhereExpressionBuilder) => string)
      | ObjectLiteral
      | ObjectLiteral[];
      params?: ObjectLiteral;
    },
  ) {
    if (!options.where) {
      throw new Error('Missing conditions');
    }

    switch (options.whereType) {
      case QueryWhereType.WHERE:
        if (typeof options.where === 'string') {
          queryBuilder.where(options.where, options.params);
        } else if (options.where instanceof Brackets) {
          queryBuilder.where(options.where);
        } else if (typeof options.where === 'function') {
          queryBuilder.where(options.where);
        } else {
          queryBuilder.where(options.where as any);
        }
        break;
      case QueryWhereType.WHERE_AND:
        if (typeof options.where === 'string') {
          queryBuilder.andWhere(options.where, options.params);
        } else if (options.where instanceof Brackets) {
          queryBuilder.andWhere(options.where);
        } else if (typeof options.where === 'function') {
          queryBuilder.andWhere(options.where);
        } else {
          queryBuilder.andWhere(options.where as any);
        }
        break;
      case QueryWhereType.WHERE_OR:
        if (typeof options.where === 'string') {
          queryBuilder.orWhere(options.where, options.params);
        } else if (options.where instanceof Brackets) {
          queryBuilder.orWhere(options.where);
        } else if (typeof options.where === 'function') {
          queryBuilder.orWhere(options.where);
        } else {
          queryBuilder.orWhere(options.where as any);
        }
        break;
      default:
        throw new Error('Unsupported where type');
    }
    return queryBuilder;
  }

  private _buildJoinCondition(joinCondition?: CondtionItem) {
    return joinCondition
      ? [
        `${joinCondition?.column}${this._parseOperator(
          joinCondition.operator || QueryOperators.EQUAL,
        )}${joinCondition.value}`,
      ]
      : [];
  }

  private _buildRelationQuery(
    queryBuilder: SelectQueryBuilder<T>,
    relations: QueryRelation[] = [],
  ) {
    relations.forEach(({ column, alias, joinType, joinCondition, order }) => {
      switch (joinType) {
        case 'count':
          queryBuilder.loadRelationCountAndMap(
            this._parseColumnName(alias),
            this._parseColumnName(column),
            alias,
          );
          break;
        case 'inner':
          queryBuilder.innerJoinAndSelect(
            `${this._parseColumnName(column)}`,
            alias,
            ...this._buildJoinCondition(joinCondition),
          );
          break;
        default:
          queryBuilder.leftJoinAndSelect(
            `${this._parseColumnName(column)}`,
            alias,
            ...this._buildJoinCondition(joinCondition),
          );
          break;
      }
      if (order) {
        queryBuilder.orderBy(
          `${this._parseColumnName(order.orderBy)}`,
          order.orderDir,
        );
      }
    });
  }

  private _parseOperator(operator?: QueryOperators): string {
    if (!operator) return '='; // Default operator

    switch (operator) {
      case QueryOperators.START_WITH:
      case QueryOperators.END_WITH:
      case QueryOperators.CONTAINS:
      case QueryOperators.CONTAIN:
      case QueryOperators.LIKE:
        return 'LIKE';
      case QueryOperators.GREATER_THAN_OR_EQUAL:
      case QueryOperators.GREATER_OR_EQUAL_THAN:
        return '>=';
      case QueryOperators.GREATER_THAN:
        return '>';
      case QueryOperators.LESS_THAN_OR_EQUAL:
      case QueryOperators.LESS_OR_EQUAL_THAN:
        return '<=';
      case QueryOperators.LESS_THAN:
        return '<';
      case QueryOperators.NOT_EQUAL:
        return '!=';
      case QueryOperators.BETWEEN:
        return 'BETWEEN';
      default:
        return '=';
    }
  }

  private _parseParameter(value: unknown, operator?: QueryOperators) {
    if (!operator) return value;

    switch (operator) {
      case QueryOperators.START_WITH:
        return `${value}%`;
      case QueryOperators.END_WITH:
        return `%${value}`;
      case QueryOperators.CONTAINS:
      case QueryOperators.CONTAIN:
        return `%${value}%`;
      default:
        return value;
    }
  }

  private _parseColumnName(name: string) {
    return name.includes('.') ? name : `${this.alias}.${name}`;
  }

  private _parseParamName(name: string): string {
    return name.includes('.') ? name.split('.').pop() || name : name;
  }

  private _toBindingVariable(name: string) {
    return `:${name}`;
  }

  private _toBindingArray(name: string) {
    return `:...${name}`;
  }
}
