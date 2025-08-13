import React from 'react';
import clsx from 'clsx';
import {FormatClearIcon} from '@ui/icons/material/FormatClear';
import {IconButton} from '@ui/buttons/icon-button';
import {MenubarButtonProps} from './menubar-button-props';
import {Tooltip} from '@ui/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';

export function ClearFormatButton({editor, size}: MenubarButtonProps) {
  return (
    <Tooltip label={<Trans message="Clear formatting" />}>
      <IconButton
        className={clsx('flex-shrink-0')}
        size={size}
        onClick={() => {
          editor.chain().focus().clearNodes().unsetAllMarks().run();
        }}
      >
        <FormatClearIcon />
      </IconButton>
    </Tooltip>
  );
}
