import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {Article} from '@common/help-desk/help-center/front/articles/article';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {PaginationResponse} from '@common/http/backend-response/pagination-response';
import {useParams} from 'react-router-dom';
import {Category} from '@common/help-desk/help-center/front/categories/category';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

export interface SearchArticlesResponse extends BackendResponse {
  pagination: PaginationResponse<Article>;
  query: string;
  category?: Category;
  categoryIds?: number[];
}

interface SearchParams {
  paginate?: 'simple' | 'lengthAware';
  perPage?: string | number;
  page?: string | number;
  query?: string;
  categoryIds?: (number | string)[];
}
interface Options {
  onSearch?: (response: SearchArticlesResponse) => void;
  disableDebounce?: boolean;
}

export function useSearchArticles(
  query: string,
  searchParams: SearchParams = {},
  options: Options = {},
) {
  const {categoryId} = useParams();
  const enabled = !!query;

  const categoryIds = categoryId ? [categoryId] : searchParams.categoryIds;

  const params = {
    query,
    categoryIds: categoryIds?.join(',') as any,
    page: searchParams.page || 1,
    perPage: searchParams.perPage || 8,
    paginate: searchParams.paginate || 'simple',
  };

  return useQuery({
    queryKey: ['hc', 'search', 'articles', params],
    queryFn: ({signal}) => searchArticles(params, options, signal),
    placeholderData: enabled ? keepPreviousData : undefined,
    enabled,
    initialData: () => {
      const data = getBootstrapData().loaders?.searchArticles;
      if (data?.query === params.query) {
        return data;
      }
    },
  });
}

async function searchArticles(
  params: SearchParams,
  options: Options,
  signal?: AbortSignal,
) {
  if (!options.disableDebounce) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  const data = await apiClient
    .get<SearchArticlesResponse>(`search/articles`, {
      params,
      signal,
    })
    .then(response => response.data);
  options.onSearch?.(data);
  return data;
}
