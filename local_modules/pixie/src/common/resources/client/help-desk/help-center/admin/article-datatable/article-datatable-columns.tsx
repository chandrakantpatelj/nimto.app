import {ColumnConfig} from '@common/datatable/column-config';
import {Trans} from '@ui/i18n/trans';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Tooltip} from '@ui/tooltip/tooltip';
import {IconButton} from '@ui/buttons/icon-button';
import {EditIcon} from '@ui/icons/material/Edit';
import React, {useContext} from 'react';
import {TableContext} from '@common/ui/tables/table-context';
import clsx from 'clsx';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {DeleteIcon} from '@ui/icons/material/Delete';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {CheckIcon} from '@ui/icons/material/Check';
import {CloseIcon} from '@ui/icons/material/Close';
import {NameWithAvatar} from '@common/datatable/column-templates/name-with-avatar';
import {Article} from '@common/help-desk/help-center/front/articles/article';
import {useDeleteArticles} from '@common/help-desk/help-center/admin/requests/use-delete-articles';
import {ArticlePath} from '@common/help-desk/help-center/front/articles/article-path';
import {Link} from 'react-router-dom';
import {getEditArticleLink} from '@common/help-desk/help-center/front/articles/article-link';
import {truncateString} from '@ui/utils/string/truncate-string';
import {stripTags} from '@ui/utils/string/strip-tags';

export const ArticleDatatableColumns: ColumnConfig<Article>[] = [
  {
    key: 'name',
    width: 'flex-3 min-w-200',
    visibleInMode: 'all',
    header: () => <Trans message="Article" />,
    body: article => <ArticleColumn article={article} />,
  },
  {
    key: 'author_id',
    allowsSorting: true,
    width: 'min-w-200',
    visibleInMode: 'all',
    header: () => <Trans message="Owner" />,
    body: article =>
      article.author ? (
        <NameWithAvatar
          image={article.author.avatar}
          label={article.author.display_name}
          description={article.author.email}
        />
      ) : null,
  },
  {
    key: 'draft',
    allowsSorting: true,
    width: 'w-100 flex-shrink-0',
    header: () => <Trans message="Published" />,
    body: article =>
      !article.draft ? (
        <CheckIcon size="md" className="text-positive" />
      ) : (
        <CloseIcon size="md" className="text-danger" />
      ),
  },
  {
    key: 'updatedAt',
    allowsSorting: true,
    width: 'w-96',
    header: () => <Trans message="Last updated" />,
    body: reply => (
      <time>
        <FormattedDate date={reply.updated_at} />
      </time>
    ),
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    width: 'w-84 flex-shrink-0',
    hideHeader: true,
    align: 'end',
    visibleInMode: 'all',
    body: article => (
      <div className="text-muted">
        <IconButton
          size="md"
          elementType={Link}
          to={getEditArticleLink(article)}
        >
          <EditIcon />
        </IconButton>
        <DialogTrigger type="modal">
          <Tooltip label={<Trans message="Delete reply" />}>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <DeleteArticleDialog article={article} />
        </DialogTrigger>
      </div>
    ),
  },
];

interface ArticleColumnProps {
  article: Article;
}
function ArticleColumn({article}: ArticleColumnProps) {
  const {isCollapsedMode} = useContext(TableContext);
  return (
    <div className="min-w-0">
      <div
        className={clsx(
          isCollapsedMode
            ? 'whitespace-normal'
            : 'overflow-hidden overflow-ellipsis whitespace-nowrap font-medium',
        )}
      >
        {article.title}
      </div>
      {!isCollapsedMode && (
        <div className="mt-4">
          <div className="text-xs">
            <ArticlePath article={article} />
          </div>
          <p className="mt-4 max-w-680 whitespace-normal text-xs text-muted">
            {truncateString(stripTags(article.body), 230)}
          </p>
        </div>
      )}
    </div>
  );
}

interface DeleteArticleDialogProps {
  article: Article;
}
export function DeleteArticleDialog({article}: DeleteArticleDialogProps) {
  const deleteArticles = useDeleteArticles();
  const {close} = useDialogContext();
  return (
    <ConfirmationDialog
      isDanger
      isLoading={deleteArticles.isPending}
      title={<Trans message="Delete article" />}
      body={<Trans message="Are you sure you want to delete this article?" />}
      confirm={<Trans message="Delete" />}
      onConfirm={() => {
        deleteArticles.mutate({ids: [article.id]}, {onSuccess: () => close()});
      }}
    />
  );
}
