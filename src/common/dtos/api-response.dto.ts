import { PaginationMeta } from './interface/pagination-meta.interface';
import { TransactionSummary } from './interface/transaction-summary.interface';

export class ApiResponseDto<T = any> {
  message: string;
  data?: T;
  summary?: TransactionSummary;
  pagination?: PaginationMeta;

  constructor(params: {
    message: string;
    data?: T;
    summary?: TransactionSummary;
    pagination?: PaginationMeta;
  }) {
    this.message = params.message;
    if (params.data !== undefined) this.data = params.data;
    if (params.summary) this.summary = params.summary;
    if (params.pagination) this.pagination = params.pagination;
  }
}
