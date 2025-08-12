import {useQuery} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {Category} from '@common/help-desk/help-center/front/categories/category';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

export interface LandingPageData extends BackendResponse {
  categories: Category[];
}

export function useLandingPage() {
  return useQuery<LandingPageData>({
    queryKey: ['hc', 'landing-page'],
    queryFn: () => fetchContent(),
    initialData: getBootstrapData().loaders?.landingPage,
  });
}

function fetchContent(): Promise<LandingPageData> {
  return apiClient.get(`hc`).then(response => response.data);
}
