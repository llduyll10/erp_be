import { ClassConstructor, plainToClass } from 'class-transformer';
import { User, UserRole } from '@/entities/users.entity';
import { ResponseDTO } from '@/base/dtos/response.dto';

export interface CommonQueryDTO {
  page: number;
  limit: number;
}

export class ResponseTransformer {
  static transform<T>(data: T, message?: string): ResponseDTO<T> {
    return new ResponseDTO({
      success: true,
      message,
      data,
    });
  }

  static transformPageable<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
  ): ResponseDTO<T[]> {
    return new ResponseDTO({
      success: true,
      message,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static transformToDTO<T, V>(data: T, dto: ClassConstructor<V>): V {
    return plainToClass(dto, data, {
      excludeExtraneousValues: true,
    });
  }
}

export function serialize<T, O>(
  transformClass: ClassConstructor<T>,
  plainObject: O,
  currentUser?: User,
) {
  return plainToClass(transformClass, plainObject, {
    excludeExtraneousValues: true,
    // TODO: Implement this after implementing role-based authorization
    ...(currentUser
      ? { groups: [currentUser.role] }
      : {
          groups: Object.values(UserRole),
        }),
  });
}

export function serializeArray<T, O>(
  transformClass: ClassConstructor<T>,
  plainArray: O[],
  currentUser?: User,
) {
  return plainArray.map((object) =>
    serialize(transformClass, object, currentUser),
  );
}

export function renderList<T, O>(
  transformClass: ClassConstructor<T>,
  plainArray: O[],
  total: number,
  query: CommonQueryDTO,
  currentUser?: User,
) {
  return {
    data: serializeArray(transformClass, plainArray, currentUser),
    pagination: {
      total_pages: Math.ceil(total / query.limit),
      total_records: total,
      records_per_page: query.limit,
      current_page: query.page,
    },
  };
}
