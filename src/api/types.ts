export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
