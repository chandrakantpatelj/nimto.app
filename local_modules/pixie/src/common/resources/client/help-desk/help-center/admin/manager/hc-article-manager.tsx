import React, {Fragment} from 'react';
import {Trans} from '@ui/i18n/trans';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {
  useArticles,
  UseArticlesResponse,
} from '@common/help-desk/help-center/admin/requests/use-articles';
import {Link} from 'react-router-dom';
import {HcManagerLayout} from '@common/help-desk/help-center/admin/manager/hc-manager-layout';
import {HcManagerBreadcrumb} from '@common/help-desk/help-center/admin/manager/hc-manager-breadcrumb';
import {HcManagerTitle} from '@common/help-desk/help-center/admin/manager/hc-manager-title';
import {HcManagerEmptyMessage} from '@common/help-desk/help-center/admin/manager/hc-manager-empty-message';
import {HcManagerRow} from '@common/help-desk/help-center/admin/manager/hc-manager-row';
import {getArticleLink} from '@common/help-desk/help-center/front/articles/article-link';
import {closeDialog, openDialog} from '@ui/overlays/store/dialog-store';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDeleteArticles} from '@common/help-desk/help-center/admin/requests/use-delete-articles';
import {Button} from '@ui/buttons/button';
import {useReorderArticles} from '@common/help-desk/help-center/admin/requests/use-reorder-articles';
import {useHcArticleManagerParams} from '@common/help-desk/help-center/admin/requests/use-hc-article-manager-params';

export function HcArticleManager() {
  const query = useArticles(useHcArticleManagerParams());
  return (
    <HcManagerLayout
      query={query}
      actionButton={
        <Button
          variant="flat"
          color="primary"
          elementType={Link}
          to="articles/new"
        >
          <Trans message="New article" />
        </Button>
      }
    >
      {data => <PageContent data={data} />}
    </HcManagerLayout>
  );
}

interface PageContentProps {
  data: UseArticlesResponse;
}
function PageContent({data}: PageContentProps) {
  const {sectionId} = useHcArticleManagerParams();
  const navigate = useNavigate();
  const deleteArticles = useDeleteArticles();
  const articles = data.pagination.data;
  const count = articles.length;
  const reorder = useReorderArticles();
  return (
    <Fragment>
      <HcManagerBreadcrumb
        category={data.section?.parent}
        section={data.section}
      />
      {count ? (
        <HcManagerTitle>
          <Trans message="Articles (:count)" values={{count}} />
        </HcManagerTitle>
      ) : null}
      {articles.map(article => (
        <HcManagerRow
          key={article.id}
          item={article}
          items={articles}
          onSortEnd={(oldIndex, newIndex) => {
            reorder.mutate({sectionId: sectionId!, oldIndex, newIndex});
          }}
          onEdit={() => navigate(`articles/${article.id}/edit`)}
          onClick={() => navigate(`articles/${article.id}/edit`)}
          onView={() =>
            navigate(getArticleLink(article, {section: data.section}))
          }
          onDelete={() => {
            openDialog(ConfirmationDialog, {
              title: <Trans message="Delete article" />,
              body: (
                <Trans message="Are you sure you want to delete this article?" />
              ),
              confirm: <Trans message="Delete" />,
              isDanger: true,
              isLoading: deleteArticles.isPending,
              onConfirm: () =>
                deleteArticles.mutate(
                  {ids: [article.id]},
                  {onSuccess: () => closeDialog()},
                ),
            });
          }}
        >
          {article.title}
        </HcManagerRow>
      ))}
      {!articles.length && (
        <HcManagerEmptyMessage
          title={<Trans message="This section is empty" />}
          description={
            <Trans message="Empty sections aren't visible in the Help Center. You can make them visible by adding an article." />
          }
        />
      )}
    </Fragment>
  );
}
