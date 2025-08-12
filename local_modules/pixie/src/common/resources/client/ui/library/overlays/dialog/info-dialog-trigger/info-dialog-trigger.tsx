import {IconButton} from '@ui/buttons/icon-button';
import {InfoDialogTriggerIcon} from '@ui/overlays/dialog/info-dialog-trigger/info-dialog-trigger-icon';
import {Dialog, DialogSize} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import React, {ReactNode} from 'react';
import clsx from 'clsx';

interface Props {
  title?: ReactNode;
  body: ReactNode;
  dialogSize?: DialogSize;
  className?: string;
}
export function InfoDialogTrigger({
  title,
  body,
  dialogSize = 'sm',
  className,
}: Props) {
  return (
    <DialogTrigger type="popover" triggerOnHover>
      <IconButton
        className={clsx('ml-4 text-muted opacity-70', className)}
        iconSize="xs"
        size="2xs"
      >
        <InfoDialogTriggerIcon viewBox="0 0 16 16" />
      </IconButton>
      <Dialog size={dialogSize}>
        {title && (
          <DialogHeader padding="px-18 pt-12" size="md" hideDismissButton>
            {title}
          </DialogHeader>
        )}
        <DialogBody>{body}</DialogBody>
      </Dialog>
    </DialogTrigger>
  );
}
