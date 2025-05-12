import { CommonQueryDTO } from '../../base/dtos/common-query.dto';

export interface PaginationResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PaginationHelper {
  static getPaginationOptions(query: CommonQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
    };
  }

  static createPaginationResponse<T>(
    items: T[],
    total: number,
    query: CommonQueryDTO,
  ): PaginationResult<T> {
    const { page = 1, limit = 10 } = query;
    
    return {
      items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
} 