import {useMutation} from '@tanstack/react-query';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {apiClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {Localization} from '@ui/i18n/localization';
import {mergeBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

interface ChangeLocaleResponse extends BackendResponse {
  locale: Localization;
}

export function useChangeLocale() {
  return useMutation({
    mutationFn: (props: {locale?: string}) => changeLocale(props),
    onSuccess: response => {
      mergeBootstrapData({
        i18n: response.locale,
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function changeLocale(props: {locale?: string}): Promise<ChangeLocaleResponse> {
  return apiClient.post(`users/me/locale`, props).then(r => r.data);
}
