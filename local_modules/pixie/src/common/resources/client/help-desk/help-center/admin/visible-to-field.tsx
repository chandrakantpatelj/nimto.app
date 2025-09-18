import {RoleSelector} from '@common/help-desk/help-center/admin/role-selector';
import {Trans} from '@ui/i18n/trans';
import {Item} from '@ui/forms/listbox/item';
import React, {ReactNode} from 'react';

interface Props {
  className?: string;
  description?: ReactNode;
}
export function VisibleToField({className, description}: Props) {
  return (
    <RoleSelector
      className={className}
      name="visible_to_role"
      label={<Trans message="Visible to" />}
      description={description}
      defaultItem={
        <Item key="everyone-default" value={null}>
          <Trans message="Everyone" />
        </Item>
      }
    />
  );
}
