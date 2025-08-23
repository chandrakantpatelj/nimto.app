import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@ui/toast/toast';
import {useTrans} from '@ui/i18n/use-trans';
import {message} from '@ui/i18n/message';
import {DatatableDataQueryKey} from '@common/datatable/requests/paginated-resources';
import {Product} from '@common/billing/product';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {CreateProductPayload} from './use-create-product';
import {UseFormReturn} from 'react-hook-form';
import {onFormQueryError} from '@common/errors/on-form-query-error';

interface Response extends BackendResponse {
  product: Product;
}

export interface UpdateProductPayload extends CreateProductPayload {
  id: number;
}

const Endpoint = (id: number) => `billing/products/${id}`;

export function useUpdateProduct(form: UseFormReturn<UpdateProductPayload>) {
  const {trans} = useTrans();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => updateProduct(payload),
    onSuccess: response => {
      toast(trans(message('Plan updated')));
      queryClient.invalidateQueries({
        queryKey: [Endpoint(response.product.id)],
      });
      queryClient.invalidateQueries({
        queryKey: DatatableDataQueryKey('billing/products'),
      });
      navigate('/admin/plans');
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateProduct({
  id,
  ...payload
}: UpdateProductPayload): Promise<Response> {
  const backendPayload = {
    ...payload,
    feature_list: payload.feature_list.map(feature => feature.value),
  };
  return apiClient.put(Endpoint(id), backendPayload).then(r => r.data);
}
