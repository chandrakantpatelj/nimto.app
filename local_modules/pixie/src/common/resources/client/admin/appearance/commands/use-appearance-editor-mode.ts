import {isSsr} from '@ui/utils/dom/is-ssr';

export function useAppearanceEditorMode() {
  return {
    isAppearanceEditorActive:
      !isSsr() &&
      ((window.frameElement as HTMLIFrameElement) || undefined)?.src.includes(
        'appearanceEditor=true',
      ),
  };
}
