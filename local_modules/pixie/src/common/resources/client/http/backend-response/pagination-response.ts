import {BackendResponse} from './backend-response';

export interface LengthAwarePaginationResponse<T = unknown> {
  data: T[];
  from: number;
  to: number;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page?: number;
  prev_page?: number;
}

export interface SimplePaginationResponse<T = unknown> {
  data: T[];
  from: number;
  to: number;
  per_page: number;
  current_page: number;
  next_page?: number | null;
  prev_page?: number | null;
}

interface CursorPaginationResponse<T> {
  data: T[];
  next_cursor: string | null;
  per_page: number;
  prev_cursor: string | null;
}

export type PaginationResponse<T> =
  | LengthAwarePaginationResponse<T>
  | SimplePaginationResponse<T>
  | CursorPaginationResponse<T>;

export const EMPTY_PAGINATION_RESPONSE = {
  pagination: {data: [], from: 0, to: 0, per_page: 15, current_page: 1},
};

export interface PaginatedBackendResponse<T> extends BackendResponse {
  pagination: PaginationResponse<T>;
}

export function hasPreviousPage(
  pagination: PaginationResponse<unknown>,
): boolean {
  if ('prev_cursor' in pagination) {
    return pagination.prev_cursor != null;
  }

  if ('prev_page' in pagination) {
    return pagination.prev_page != null;
  }

  return pagination.current_page > 1;
}

export function hasNextPage(pagination: PaginationResponse<unknown>): boolean {
  if ('next_cursor' in pagination) {
    return pagination.next_cursor != null;
  }

  if ('last_page' in pagination) {
    return pagination.current_page < pagination.last_page;
  }

  if ('next_page' in pagination) {
    return pagination.next_page != null;
  }

  return (
    pagination.data.length > 0 && pagination.data.length >= pagination.per_page
  );
}
