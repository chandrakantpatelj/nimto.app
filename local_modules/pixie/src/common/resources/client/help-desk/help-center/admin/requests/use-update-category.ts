import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {useTrans} from '@ui/i18n/use-trans';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@ui/toast/toast';
import {message} from '@ui/i18n/message';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {UseFormReturn} from 'react-hook-form';
import {
  Category,
  Section,
} from '@common/help-desk/help-center/front/categories/category';
import {CreateCategoryPayload} from '@common/help-desk/help-center/admin/requests/use-create-category';

interface Response extends BackendResponse {
  category: Category | Section;
}

interface UpdateCategoryPayload extends CreateCategoryPayload {
  id: number;
}

export function useUpdateCategory(form: UseFormReturn<CreateCategoryPayload>) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => updateCategory(payload),
    onSuccess: async response => {
      await queryClient.invalidateQueries({queryKey: ['hc', 'categories']});
      const part = response.category.is_section ? 'sections' : 'categories';
      toast(
        trans(
          response.category.is_section
            ? message('Category updated')
            : message('Section updated'),
        ),
      );
    },
    onError: err => onFormQueryError(err, form),
  });
}

function updateCategory({
  id,
  ...payload
}: UpdateCategoryPayload): Promise<Response> {
  return apiClient.put(`hc/categories/${id}`, payload).then(r => r.data);
}
