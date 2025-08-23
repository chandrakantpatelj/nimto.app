import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {Section} from '@common/help-desk/help-center/front/categories/category';
import {useParams} from 'react-router-dom';

export interface GetHcSidenavResponse extends BackendResponse {
  sections: Section[];
}

export function useHcSidenavContent() {
  const {categoryId} = useParams();
  return useQuery({
    queryKey: ['hc', 'sidenav', `${categoryId}`],
    queryFn: () => fetchSidenavContent(categoryId!),
  });
}

function fetchSidenavContent(
  categoryId: number | string,
): Promise<GetHcSidenavResponse> {
  return apiClient
    .get(`hc/sidenav/${categoryId}`)
    .then(response => response.data);
}
