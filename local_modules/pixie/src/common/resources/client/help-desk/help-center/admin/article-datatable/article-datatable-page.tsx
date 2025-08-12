import {Trans} from '@ui/i18n/trans';
import {DataTablePage} from '@common/datatable/page/data-table-page';
import {DataTableAddItemButton} from '@common/datatable/data-table-add-item-button';
import {DataTableEmptyStateMessage} from '@common/datatable/page/data-table-emty-state-message';
import {DeleteSelectedItemsAction} from '@common/datatable/page/delete-selected-items-action';
import onlineArticlesImg from './online-articles.svg';
import {ArticleDatatableColumns} from '@common/help-desk/help-center/admin/article-datatable/article-datatable-columns';
import {ArticleDatatableFilters} from '@common/help-desk/help-center/admin/article-datatable/canned-replies-datatable-filters';
import {Link} from 'react-router-dom';

export function ArticleDatatablePage() {
  return (
    <DataTablePage
      endpoint="hc/articles"
      queryParams={{
        with: 'body,path,author',
        defaultOrder: 'updated_at|desc',
      }}
      title={<Trans message="Articles" />}
      columns={ArticleDatatableColumns}
      filters={ArticleDatatableFilters}
      actions={<Actions />}
      selectedActions={<DeleteSelectedItemsAction />}
      enableSelection={false}
      cellHeight="h-90"
      emptyStateMessage={
        <DataTableEmptyStateMessage
          image={onlineArticlesImg}
          title={<Trans message="No articles have been created yet" />}
          filteringTitle={<Trans message="No matching articles" />}
        />
      }
    />
  );
}

function Actions() {
  return (
    <DataTableAddItemButton elementType={Link} to="new">
      <Trans message="Add article" />
    </DataTableAddItemButton>
  );
}
