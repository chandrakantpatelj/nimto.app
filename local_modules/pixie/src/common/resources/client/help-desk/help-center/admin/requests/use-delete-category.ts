import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {toast} from '@ui/toast/toast';
import {message} from '@ui/i18n/message';

interface Response extends BackendResponse {}

interface Payload {
  id: number | string;
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: (payload: Payload) => deleteCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['hc', 'categories']});
      toast(message('Category deleted'));
    },
    onError: err => showHttpErrorToast(err),
  });
}

function deleteCategory({id}: Payload) {
  return apiClient.delete<Response>(`hc/categories/${id}`).then(r => r.data);
}
