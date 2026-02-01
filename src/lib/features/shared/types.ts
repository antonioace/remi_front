export interface HttpResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}
