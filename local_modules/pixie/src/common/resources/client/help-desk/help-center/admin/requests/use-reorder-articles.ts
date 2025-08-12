import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {moveItemInNewArray} from '@ui/utils/array/move-item-in-new-array';
import {
  fetchArticlesQueryKey,
  UseArticlesResponse,
} from '@common/help-desk/help-center/admin/requests/use-articles';
import {useHcArticleManagerParams} from '@common/help-desk/help-center/admin/requests/use-hc-article-manager-params';

interface Response extends BackendResponse {}

interface Payload {
  sectionId: number | string;
  oldIndex: number;
  newIndex: number;
}
export function useReorderArticles() {
  const queryKey = fetchArticlesQueryKey(useHcArticleManagerParams());
  return useMutation({
    mutationFn: (payload: Payload) => {
      // ids are already moved in "onMutate", no need to do it again here
      const ids = queryClient
        .getQueryData<UseArticlesResponse>(queryKey)!
        .pagination.data.map(c => c.id);
      return reorder({
        sectionId: payload.sectionId,
        ids,
      });
    },
    onMutate: async ({oldIndex, newIndex}) => {
      await queryClient.cancelQueries({queryKey});
      const previousResponse = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<UseArticlesResponse>(queryKey, prev => {
        const newData = {...prev, pagination: {...prev!.pagination}};
        newData.pagination.data = moveItemInNewArray(
          newData.pagination.data,
          oldIndex,
          newIndex,
        );
        return newData;
      });
      return {previousResponse};
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['hc', 'articles']});
    },
    onError: (err, _, context) => {
      showHttpErrorToast(err);
      queryClient.setQueryData(queryKey, context?.previousResponse);
    },
  });
}

function reorder(payload: {sectionId: number | string; ids: number[]}) {
  return apiClient
    .post<Response>(
      `hc/categories/${payload.sectionId}/articles/reorder`,
      payload,
    )
    .then(r => r.data);
}
