import React from 'react';
import clsx from 'clsx';
import {IconButton} from '@ui/buttons/icon-button';
import {FormatIndentDecreaseIcon} from '@ui/icons/material/FormatIndentDecrease';
import {FormatIndentIncreaseIcon} from '@ui/icons/material/FormatIndentIncrease';
import {MenubarButtonProps} from './menubar-button-props';
import {Tooltip} from '@ui/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';

export function IndentButtons({editor, size}: MenubarButtonProps) {
  return (
    <span className={clsx('flex-shrink-0', 'whitespace-nowrap')}>
      <Tooltip label={<Trans message="Decrease indent" />}>
        <IconButton
          size={size}
          onClick={() => {
            editor.commands.focus();
            editor.commands.outdent();
          }}
        >
          <FormatIndentDecreaseIcon />
        </IconButton>
      </Tooltip>
      <Tooltip label={<Trans message="Increase indent" />}>
        <IconButton
          size={size}
          onClick={() => {
            editor.commands.focus();
            editor.commands.indent();
          }}
        >
          <FormatIndentIncreaseIcon />
        </IconButton>
      </Tooltip>
    </span>
  );
}
