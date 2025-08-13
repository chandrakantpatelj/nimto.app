import React from 'react';
import {useStore} from '../../../state/store';
import {ButtonGroup} from '@ui/buttons/button-group';
import {IconButton} from '@ui/buttons/icon-button';
import {tools} from '../../../state/utils';
import {UndoIcon} from '@ui/icons/material/Undo';
import {RedoIcon} from '@ui/icons/material/Redo';

export function UndoRedoBtns() {
  const canUndo = useStore(s => s.history.canUndo);
  const canRedo = useStore(s => s.history.canRedo);

  return (
    <ButtonGroup variant="outline">
      <IconButton
        key="undo"
        equalWidth={false}
        size="xs"
        padding="pl-12 pr-10"
        radius="rounded-full"
        disabled={!canUndo}
        onClick={() => {
          tools().history.undo();
        }}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        key="redo"
        equalWidth={false}
        padding="pl-10 pr-12"
        size="xs"
        radius="rounded-full"
        disabled={!canRedo}
        onClick={() => {
          tools().history.redo();
        }}
      >
        <RedoIcon />
      </IconButton>
    </ButtonGroup>
  );
}
