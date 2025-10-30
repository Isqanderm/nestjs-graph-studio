import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface QueryParamsDto {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ParseQueryParamsPipe implements PipeTransform<any, QueryParamsDto> {
  transform(value: any): QueryParamsDto {
    const result: QueryParamsDto = {};

    // Parse page number
    if (value.page !== undefined) {
      const page = parseInt(value.page, 10);
      if (isNaN(page) || page < 1) {
        throw new BadRequestException('Page must be a positive integer');
      }
      result.page = page;
    } else {
      result.page = 1; // Default page
    }

    // Parse limit
    if (value.limit !== undefined) {
      const limit = parseInt(value.limit, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
      result.limit = limit;
    } else {
      result.limit = 10; // Default limit
    }

    // Parse status filter
    if (value.status) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(value.status.toLowerCase())) {
        throw new BadRequestException(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        );
      }
      result.status = value.status.toLowerCase();
    }

    // Parse sortBy
    if (value.sortBy) {
      const validSortFields = ['createdAt', 'total', 'status', 'customerId'];
      if (!validSortFields.includes(value.sortBy)) {
        throw new BadRequestException(
          `Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`,
        );
      }
      result.sortBy = value.sortBy;
    } else {
      result.sortBy = 'createdAt'; // Default sort
    }

    // Parse sortOrder
    if (value.sortOrder) {
      const order = value.sortOrder.toLowerCase();
      if (order !== 'asc' && order !== 'desc') {
        throw new BadRequestException('Sort order must be "asc" or "desc"');
      }
      result.sortOrder = order as 'asc' | 'desc';
    } else {
      result.sortOrder = 'desc'; // Default order
    }

    return result;
  }
}

