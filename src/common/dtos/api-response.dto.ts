import { Pagination } from './interface/pagination.interface';
import { Summary } from './interface/summary.interface';

export class ApiResponseDto<T = any> {
  message: string;
  data?: T;
  summary?: Summary;
  pagination?: Pagination;

  constructor(params: {
    message: string;
    data?: T;
    summary?: Summary;
    pagination?: Pagination;
  }) {
    this.message = params.message;
    if (params.data !== undefined) this.data = params.data;
    if (params.summary) this.summary = params.summary;
    if (params.pagination) this.pagination = params.pagination;
  }
}
