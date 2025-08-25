import React, {Fragment} from 'react';
import {DataTableEmptyStateMessage} from '@common/datatable/page/data-table-emty-state-message';
import playlist from './playlist.svg';
import {DataTableAddItemButton} from '@common/datatable/data-table-add-item-button';
import {InfoDialogTrigger} from '@ui/overlays/dialog/info-dialog-trigger/info-dialog-trigger';
import {Link} from 'react-router-dom';
import {ChannelsDatatableColumns} from '@common/admin/channels/channels-datatable-columns';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {useApplyChannelPreset} from '@common/admin/channels/requests/use-apply-channel-preset';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {DataTablePage} from '@common/datatable/page/data-table-page';
import {DeleteSelectedItemsAction} from '@common/datatable/page/delete-selected-items-action';
import {useDataTable} from '@common/datatable/page/data-table-context';
import {Channel} from '@common/channels/channel';
import {Item} from '@ui/forms/listbox/item';
import {KeyboardArrowDownIcon} from '@ui/icons/material/KeyboardArrowDown';
import {openDialog} from '@ui/overlays/store/dialog-store';
import {ChannelsDocsLink} from '@common/admin/channels/channels-docs-link';
import {Trans} from '@ui/i18n/trans';
import {Menu, MenuTrigger} from '@ui/menu/menu-trigger';
import {Button} from '@ui/buttons/button';

interface ChannelPresetConfig {
  preset: string;
  name: string;
  description: string;
}

export function ChannelsDatatablePage() {
  return (
    <DataTablePage
      endpoint="channel"
      title={<Trans message="Channels" />}
      headerContent={<InfoTrigger />}
      headerItemsAlign="items-center"
      queryParams={{type: 'channel'}}
      columns={ChannelsDatatableColumns}
      actions={<Actions />}
      selectedActions={<DeleteSelectedItemsAction />}
      cellHeight="h-52"
      emptyStateMessage={
        <DataTableEmptyStateMessage
          image={playlist}
          title={<Trans message="No channels have been created yet" />}
          filteringTitle={<Trans message="No matching channels" />}
        />
      }
    />
  );
}

function InfoTrigger() {
  return (
    <InfoDialogTrigger
      body={
        <Fragment>
          <Trans message="Channels are used to create pages that show various content on the site." />
          <ChannelsDocsLink className="mt-14" />
        </Fragment>
      }
    />
  );
}

function Actions() {
  const {query} = useDataTable<Channel, {presets: ChannelPresetConfig[]}>();
  return (
    <Fragment>
      <MenuTrigger
        onItemSelected={preset => openDialog(ApplyPresetDialog, {preset})}
      >
        <Button
          variant="outline"
          color="primary"
          size="sm"
          endIcon={<KeyboardArrowDownIcon />}
          disabled={!query.data?.presets.length}
        >
          <Trans message="Apply preset" />
        </Button>
        <Menu>
          {query.data?.presets.map(preset => (
            <Item
              key={preset.preset}
              value={preset.preset}
              description={<Trans message={preset.description} />}
            >
              <Trans message={preset.name} />
            </Item>
          ))}
        </Menu>
      </MenuTrigger>
      <DataTableAddItemButton elementType={Link} to="new">
        <Trans message="Add new channel" />
      </DataTableAddItemButton>
    </Fragment>
  );
}

interface ApplyPresetDialogProps {
  preset: string;
}
function ApplyPresetDialog({preset}: ApplyPresetDialogProps) {
  const {close} = useDialogContext();
  const resetChannels = useApplyChannelPreset();
  return (
    <ConfirmationDialog
      isLoading={resetChannels.isPending}
      onConfirm={() => {
        resetChannels.mutate({preset}, {onSuccess: () => close()});
      }}
      isDanger
      title={<Trans message="Apply preset" />}
      body={
        <Trans message="Are you sure you want to apply this channel preset? This will delete all current channels and leave only channels from the selected preset." />
      }
      confirm={<Trans message="Apply" />}
    />
  );
}
