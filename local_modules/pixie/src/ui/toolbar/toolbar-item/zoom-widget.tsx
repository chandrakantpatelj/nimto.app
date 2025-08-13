import React from 'react';
import {useStore} from '../../../state/store';
import {IconButton} from '@ui/buttons/icon-button';
import {RemoveIcon} from '@ui/icons/material/Remove';
import {AddIcon} from '@ui/icons/material/Add';
import {tools} from '../../../state/utils';

export function ZoomWidget() {
  const zoom = useStore(s => s.zoom) || 1;
  const allowUserZoom =
    useStore(s => s.config.tools?.zoom?.allowUserZoom) ?? true;

  if (!allowUserZoom) {
    return null;
  }

  return (
    <div className="flex items-center select-none">
      <IconButton
        size="sm"
        disabled={!tools().zoom?.canZoomOut()}
        onClick={() => {
          tools().zoom.zoomOut(tools().zoom.step);
        }}
      >
        <RemoveIcon />
      </IconButton>
      <div className="w-[4ch] text-sm text-center">
        {Math.round(zoom * 100)}%
      </div>
      <IconButton
        size="sm"
        disabled={!tools().zoom?.canZoomIn()}
        onClick={() => {
          tools().zoom.zoomIn(tools().zoom.step);
        }}
      >
        <AddIcon />
      </IconButton>
    </div>
  );
}
