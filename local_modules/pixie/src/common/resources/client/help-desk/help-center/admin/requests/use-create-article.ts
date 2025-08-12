import {useMutation} from '@tanstack/react-query';
import {apiClient, queryClient} from '@common/http/query-client';
import {useTrans} from '@ui/i18n/use-trans';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {toast} from '@ui/toast/toast';
import {message} from '@ui/i18n/message';
import {onFormQueryError} from '@common/errors/on-form-query-error';
import {UseFormReturn} from 'react-hook-form';
import {
  Article,
  ArticleAttachment,
} from '@common/help-desk/help-center/front/articles/article';
import {ChipValue} from '@ui/forms/input-field/chip-field/chip-field';

interface Response extends BackendResponse {
  article: Article;
}

export interface CreateArticlePayload {
  title: string;
  body: string;
  slug?: string;
  draft: boolean;
  visibility: 'public' | 'private';
  visible_to_role?: number;
  author_id?: number;
  managed_by_role?: number;
  description?: string;
  sections?: number[];
  tags?: ChipValue[];
  attachments?: ArticleAttachment[];
}

export function useCreateArticle(form: UseFormReturn<CreateArticlePayload>) {
  const {trans} = useTrans();
  return useMutation({
    mutationFn: (props: CreateArticlePayload) => createArticle(props),
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({queryKey: ['hc', 'categories']}),
        queryClient.invalidateQueries({queryKey: ['hc', 'articles']}),
      ]);
      toast(trans(message('Article created')));
    },
    onError: err => onFormQueryError(err, form),
  });
}

export function articleEditorFormValueToPayload(
  formValue: Partial<CreateArticlePayload>,
) {
  return {
    ...formValue,
    attachments: formValue.attachments?.map(a => a.id),
    tags: formValue.tags?.map(t => t.name),
  };
}

function createArticle(formValue: CreateArticlePayload): Promise<Response> {
  return apiClient
    .post('hc/articles', articleEditorFormValueToPayload(formValue))
    .then(r => r.data);
}
