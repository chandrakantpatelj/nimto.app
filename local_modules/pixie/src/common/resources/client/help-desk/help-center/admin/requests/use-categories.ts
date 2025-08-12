import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {PaginationResponse} from '@common/http/backend-response/pagination-response';
import {
  Category,
  Section,
} from '@common/help-desk/help-center/front/categories/category';
import {BackendResponse} from '@common/http/backend-response/backend-response';

export const fetchCategoriesQueryKey = (params: UseCategoriesParams) => [
  'hc',
  'categories',
  'admin',
  params,
];

export interface UseCategoriesResponse extends BackendResponse {
  pagination: PaginationResponse<Category | Section>;
  category?: Category;
}

export interface UseCategoriesParams {
  type?: 'section' | 'category';
  parentId?: number | string;
  load?: 'sections'[];
  compact?: boolean;
}

export function useCategories(params: UseCategoriesParams) {
  return useQuery({
    queryKey: fetchCategoriesQueryKey(params),
    queryFn: () => fetchCategories(params),
  });
}

function fetchCategories(params: UseCategoriesParams) {
  return apiClient
    .get<UseCategoriesResponse>(`hc/categories`, {
      params: {paginate: 'simple', perPage: 30, ...params},
    })
    .then(response => response.data);
}
