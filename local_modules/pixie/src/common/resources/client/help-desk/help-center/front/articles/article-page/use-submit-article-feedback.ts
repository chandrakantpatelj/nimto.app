import {useMutation} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useParams} from 'react-router-dom';

interface Payload {
  wasHelpful: boolean;
  comment?: string;
}

export function useSubmitArticleFeedback() {
  const {articleId} = useParams();
  return useMutation({
    mutationFn: (payload: Payload) => submitFeedback(articleId!, payload),
    onSuccess: () => {
      //
    },
    onError: err => showHttpErrorToast(err),
  });
}

function submitFeedback(articleId: string, payload: Payload) {
  return apiClient
    .post<BackendResponse>(`hc/articles/${articleId}/feedback`, payload)
    .then(r => r.data);
}
