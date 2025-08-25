import {Trans} from '@ui/i18n/trans';
import React, {ReactNode} from 'react';

interface Props {
  children: ReactNode;
}
export function HcManagerTitle({children}: Props) {
  return (
    <h2 className="mb-10 mt-20 text-sm font-semibold text-muted">{children}</h2>
  );
}
