import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {toast} from '@ui/toast/toast';
import {message} from '@ui/i18n/message';

interface Response extends BackendResponse {}

interface Payload {
  ids: (number | string)[];
}

export function useDeleteArticles() {
  return useMutation({
    mutationFn: (payload: Payload) => deleteArticle(payload),
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({queryKey: ['hc', 'categories']}),
        queryClient.invalidateQueries({queryKey: ['hc', 'articles']}),
        queryClient.invalidateQueries({queryKey: ['articles']}),
      ]);
      toast(message('Article deleted'));
    },
    onError: err => showHttpErrorToast(err),
  });
}

function deleteArticle({ids}: Payload) {
  return apiClient
    .delete<Response>(`hc/articles/${ids.join(',')}`)
    .then(r => r.data);
}
