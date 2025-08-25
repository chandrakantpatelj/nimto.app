import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';
import {UserDatatableFilters} from '@common/admin/users/user-datatable-filters';
import {DataTablePage} from '@common/datatable/page/data-table-page';
import {Trans} from '@ui/i18n/trans';
import {DeleteSelectedItemsAction} from '@common/datatable/page/delete-selected-items-action';
import {DataTableEmptyStateMessage} from '@common/datatable/page/data-table-emty-state-message';
import teamSvg from '../roles/team.svg';
import {DataTableAddItemButton} from '@common/datatable/data-table-add-item-button';
import {DataTableExportCsvButton} from '@common/datatable/csv-export/data-table-export-csv-button';
import {useSettings} from '@ui/settings/use-settings';
import {userDatatableColumns} from '@common/admin/users/user-datatable-columns';

export function UserDatatable() {
  const {billing} = useSettings();

  const filteredColumns = !billing.enable
    ? userDatatableColumns.filter(c => c.key !== 'subscribed')
    : userDatatableColumns;

  return (
    <Fragment>
      <DataTablePage
        endpoint="users"
        title={<Trans message="Users" />}
        filters={UserDatatableFilters}
        columns={filteredColumns}
        actions={<Actions />}
        queryParams={{with: 'subscriptions,bans,lastLogin'}}
        selectedActions={<DeleteSelectedItemsAction />}
        emptyStateMessage={
          <DataTableEmptyStateMessage
            image={teamSvg}
            title={<Trans message="No users have been created yet" />}
            filteringTitle={<Trans message="No matching users" />}
          />
        }
      />
    </Fragment>
  );
}

function Actions() {
  return (
    <Fragment>
      <DataTableExportCsvButton endpoint="users/csv/export" />
      <DataTableAddItemButton elementType={Link} to="new">
        <Trans message="Add new user" />
      </DataTableAddItemButton>
    </Fragment>
  );
}
