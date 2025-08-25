import React, {ReactElement} from 'react';
import type {MenubarItemProps} from './toolbar-item';
import {state} from '@app/state/utils';
import {Item} from '@ui/forms/listbox/item';
import {Menu, MenuTrigger} from '@ui/menu/menu-trigger';

interface DropdownButtonProps extends MenubarItemProps {
  button: ReactElement;
}

export function DropdownButton({item, button}: DropdownButtonProps) {
  return (
    <MenuTrigger>
      {button}
      <Menu>
        {(item.menuItems || []).map(item => (
          <Item
            key={item.label}
            value={item.label}
            onSelected={() => {
              item.action(state().editor);
            }}
          >
            {item.label}
          </Item>
        ))}
      </Menu>
    </MenuTrigger>
  );
}
