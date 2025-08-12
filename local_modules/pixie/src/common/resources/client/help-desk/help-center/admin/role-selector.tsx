import {useValueLists} from '@common/http/value-lists';
import {Trans} from '@ui/i18n/trans';
import {Item} from '@ui/forms/listbox/item';
import React, {ReactNode} from 'react';
import {FormSelect} from '@ui/forms/select/select';
import clsx from 'clsx';

interface Props {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  defaultItem?: ReactNode;
}
export function RoleSelector({
  name,
  label,
  description,
  className,
  defaultItem,
}: Props) {
  const {data} = useValueLists(['roles']);
  const roles = data?.roles || [];

  if (!roles.length) return <div className={clsx(className, 'h-92')} />;

  return (
    <FormSelect
      background="bg"
      label={label}
      name={name}
      description={description}
      className={className}
      valueClassName="first:capitalize"
      selectionMode="single"
    >
      {defaultItem}
      {roles.map(role => (
        <Item value={role.id} key={role.id} capitalizeFirst>
          <Trans message={role.name} />
        </Item>
      ))}
    </FormSelect>
  );
}
