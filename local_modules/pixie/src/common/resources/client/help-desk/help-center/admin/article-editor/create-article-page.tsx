import React, {useRef} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Trans} from '@ui/i18n/trans';
import {Editor} from '@tiptap/react';
import {toast} from '@ui/toast/toast';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {
  ArticleEditorLayout,
  HcArticleBodyEditor,
} from '@common/help-desk/help-center/admin/article-editor/hc-article-body-editor';
import {ArticleEditorAside} from '@common/help-desk/help-center/admin/article-editor/article-editor-aside';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {
  CreateArticlePayload,
  useCreateArticle,
} from '@common/help-desk/help-center/admin/requests/use-create-article';
import {useParams} from 'react-router-dom';
import {FormSelect} from '@ui/forms/select/select';
import {Item} from '@ui/forms/listbox/item';
import {useAuth} from '@common/auth/use-auth';

export function CreateArticlePage() {
  const {sectionId} = useParams();
  const navigate = useNavigate();
  const {trans} = useTrans();
  const editor = useRef<Editor>();
  const {user} = useAuth();
  const form = useForm<CreateArticlePayload>({
    defaultValues: {
      draft: true,
      sections: sectionId ? [parseInt(sectionId)] : [],
      author_id: user?.id,
    },
  });

  const createArticle = useCreateArticle(form);
  const handleSave = () => {
    if (!editor.current) return null;
    createArticle.mutate(
      {
        ...form.getValues(),
        body: editor.current.getHTML(),
      },
      {
        onSuccess: response => {
          toast(trans(message('Article created')));
          navigate(`../${response.article.id}/edit`, {
            relative: 'path',
            replace: true,
          });
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <StaticPageTitle>
        <Trans message="New article" />
      </StaticPageTitle>
      <ArticleEditorLayout
        aside={
          <ArticleEditorAside
            onSave={() => handleSave()}
            isSaving={createArticle.isPending}
          >
            <FormSelect
              name="draft"
              label={<Trans message="Publication status" />}
              selectionMode="single"
              background="bg"
              className="mb-24"
            >
              <Item value={false}>
                <Trans message="Published" />
              </Item>
              <Item value={true}>
                <Trans message="Draft" />
              </Item>
            </FormSelect>
          </ArticleEditorAside>
        }
      >
        <HcArticleBodyEditor onLoad={e => (editor.current = e)} />
      </ArticleEditorLayout>
    </FormProvider>
  );
}
