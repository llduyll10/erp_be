import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CommonQueryDTO } from '../../base/dtos/common-query.dto';

export function ApiPaginatedResponse(type: any) {
  return applyDecorators(
    ApiOperation({ summary: 'Get paginated list' }),
    ApiQuery({ type: CommonQueryDTO }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved list',
      schema: {
        properties: {
          items: {
            type: 'array',
            items: { $ref: `#/components/schemas/${type.name}` },
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
    }),
  );
}

export function ApiErrorResponse(options: {
  status: number;
  description: string;
}) {
  return ApiResponse({
    status: options.status,
    description: options.description,
    schema: {
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  });
} 