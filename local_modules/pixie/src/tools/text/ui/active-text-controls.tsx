import {Button} from '@ui/buttons/button';
import {ActiveObjectControls} from '@app/objects/ui/active-obj-controls/active-object-controls';
import {ToolControlsOverlayWrapper} from '@app/ui/navbar/tool-controls-overlay-wrapper';
import {state, tools} from '@app/state/utils';
import {Trans} from '@ui/i18n/trans';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';

export function ActiveTextControls() {
  const isMobile = useIsMobileMediaQuery();
  const actionBtn = !isMobile && (
    <Button
      size="sm"
      color="primary"
      variant="outline"
      onClick={() => {
        tools().text.add();
        state().setDirty(true);
      }}
    >
      <Trans message="New Text" />
    </Button>
  );
  return (
    <ToolControlsOverlayWrapper actionBtn={actionBtn}>
      <ActiveObjectControls />
    </ToolControlsOverlayWrapper>
  );
}
