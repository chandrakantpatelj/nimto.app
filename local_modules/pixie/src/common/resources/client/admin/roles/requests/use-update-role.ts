import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@ui/toast/toast';
import {Role} from '@common/auth/role';
import {useTrans} from '@ui/i18n/use-trans';
import {message} from '@ui/i18n/message';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {useNavigate} from '@common/ui/navigation/use-navigate';

interface Response extends BackendResponse {
  role: Role;
}

interface Payload extends Partial<Role> {
  id: number;
}

const Endpoint = (id: number) => `roles/${id}`;

export function useUpdateRole() {
  const {trans} = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: Payload) => updateRole(payload),
    onSuccess: response => {
      toast(trans(message('Role updated')));
      queryClient.invalidateQueries({queryKey: [Endpoint(response.role.id)]});
      queryClient.invalidateQueries({queryKey: DatatableDataQueryKey('roles')});
      navigate('/admin/roles');
    },
    onError: err => showHttpErrorToast(err),
  });
}

function updateRole({id, ...payload}: Payload): Promise<Response> {
  return apiClient.put(Endpoint(id), payload).then(r => r.data);
}
