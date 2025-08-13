import {Article} from '@common/help-desk/help-center/front/articles/article';
import {useUpdateArticle} from '@common/help-desk/help-center/admin/requests/use-update-article';
import {Button} from '@ui/buttons/button';
import {Trans} from '@ui/i18n/trans';
import React from 'react';

interface Props {
  article: Article;
}
export function TogglePublishedButton({article}: Props) {
  const updateArticle = useUpdateArticle();
  return (
    <Button
      variant="link"
      color="primary"
      disabled={updateArticle.isPending}
      onClick={() => {
        updateArticle.mutate({
          id: article.id,
          draft: !article.draft,
        });
      }}
    >
      {article.draft ? (
        <Trans message="Publish" />
      ) : (
        <Trans message="Unpublish" />
      )}
    </Button>
  );
}
