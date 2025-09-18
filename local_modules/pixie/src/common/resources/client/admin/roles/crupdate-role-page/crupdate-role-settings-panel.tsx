import {Role} from '@common/auth/role';
import {useTrans} from '@ui/i18n/use-trans';
import {useFormContext} from 'react-hook-form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import {message} from '@ui/i18n/message';
import {FormSelect} from '@ui/forms/select/select';
import {Item} from '@ui/forms/listbox/item';
import {FormSwitch} from '@ui/forms/toggle/switch';
import {FormPermissionSelector} from '@common/auth/ui/permission-selector';
import {useSettings} from '@ui/settings/use-settings';
import {Button} from '@ui/buttons/button';

interface CrupdateRolePageSettingsPanelProps {
  isInternal?: boolean;
}
export function CrupdateRolePageSettingsPanel({
  isInternal = false,
}: CrupdateRolePageSettingsPanelProps) {
  const {trans} = useTrans();
  const {workspaces} = useSettings();
  const {watch, setValue} = useFormContext<Role>();
  const watchedType = watch('type');

  return (
    <>
      <FormTextField
        label={<Trans message="Name" />}
        name="name"
        className="mb-20"
        required
      />
      <FormTextField
        label={<Trans message="Description" />}
        name="description"
        inputElementType="textarea"
        placeholder={trans(message('Role description...'))}
        rows={4}
        className="mb-20"
      />
      {workspaces.integrated && (
        <FormSelect
          label={<Trans message="Type" />}
          name="type"
          selectionMode="single"
          className="mb-20"
          description={
            <Trans message="Whether this role will be assigned to users globally on the site or only within workspaces." />
          }
        >
          <Item value="sitewide">
            <Trans message="Sitewide" />
          </Item>
          <Item value="workspace">
            <Trans message="Workspace" />
          </Item>
        </FormSelect>
      )}
      {!isInternal && (
        <>
          <FormSwitch
            name="default"
            className="mb-20"
            description={
              <Trans message="Assign this role to new users automatically." />
            }
          >
            <Trans message="Default" />
          </FormSwitch>
          {watchedType === 'sitewide' && (
            <FormSwitch
              name="guests"
              description={
                <Trans message="Assign this role to guests (not logged in users)." />
              }
            >
              <Trans message="Guests" />
            </FormSwitch>
          )}
        </>
      )}
      <div className="mb-14 mt-30 flex items-end justify-between gap-12">
        <h2 className="text-lg leading-tight">
          <Trans message="Permissions" />
        </h2>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setValue('permissions', [])}
        >
          <Trans message="Remove all" />
        </Button>
      </div>
      <FormPermissionSelector
        name="permissions"
        valueListKey={
          watchedType === 'sitewide' ? 'permissions' : 'workspacePermissions'
        }
      />
    </>
  );
}
