import {ToolName} from '../tools/tool-name';
import type {NavItem} from './default-config';
import type {Pixie} from '../pixie';
import {HISTORY_DISPLAY_NAMES} from '../tools/history/history-display-names';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {message} from '@ui/i18n/message';

export const DEFAULT_NAV_ITEMS: NavItem[] = Object.values(ToolName).map(
  toolName => {
    return {
      name: toolName,
      icon: HISTORY_DISPLAY_NAMES[toolName].icon,
      action:
        toolName === ToolName.MERGE
          ? (editor: Pixie) => {
              editor.tools.merge.apply();
            }
          : toolName,
    };
  },
);

export const navItemMessages: Record<string, MessageDescriptor> = {
  filter: message('filter'),
  resize: message('resize'),
  crop: message('crop'),
  draw: message('draw'),
  text: message('text'),
  shapes: message('shapes'),
  stickers: message('stickers'),
  frame: message('frame'),
  corners: message('corners'),
  merge: message('merge'),
};
