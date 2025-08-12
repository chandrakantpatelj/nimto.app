import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@ui/toast/toast';
import {Role} from '@common/auth/role';
import {useTrans} from '@ui/i18n/use-trans';
import {message} from '@ui/i18n/message';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {UseFormReturn} from 'react-hook-form';

interface Response extends BackendResponse {
  role: Role;
}

export interface CreateRolePayload extends Partial<Role> {}

const Endpoint = 'roles';

export function useCreateRole(form: UseFormReturn<CreateRolePayload>) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      toast(trans(message('Created new role')));
      queryClient.invalidateQueries({queryKey: DatatableDataQueryKey('roles')});
    },
    onError: r => onFormQueryError(r, form),
  });
}

function createRole({id, ...payload}: CreateRolePayload): Promise<Response> {
  return apiClient.post(Endpoint, payload).then(r => r.data);
}
