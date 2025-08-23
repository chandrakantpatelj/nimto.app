import {ComponentType} from 'react';
import {ToolName} from '../tool-name';
import {TuneIcon} from '@ui/icons/material/Tune';
import {PhotoSizeSelectLargeIcon} from '@ui/icons/material/PhotoSizeSelectLarge';
import {CropIcon} from '@ui/icons/material/Crop';
import {TextFieldsIcon} from '@ui/icons/material/TextFields';
import {ExtensionIcon} from '@ui/icons/material/Extension';
import {FaceIcon} from '@ui/icons/material/Face';
import {FilterFramesIcon} from '@ui/icons/material/FilterFrames';
import {MergeIcon} from '@ui/icons/material/Merge';
import {RoundedCornerIcon} from '@ui/icons/material/RoundedCorner';
import {PhotoLibraryIcon} from '@ui/icons/material/PhotoLibrary';
import {HistoryIcon} from '@ui/icons/material/History';
import {StyleIcon} from '@ui/icons/material/Style';
import {DeleteIcon} from '@ui/icons/material/Delete';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {DrawIcon} from '../../ui/icons/draw';
import {HomeIcon} from '@ui/icons/material/Home';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {message} from '@ui/i18n/message';

export const HISTORY_DISPLAY_NAMES: Record<
  HistoryName,
  {name: MessageDescriptor; icon: ComponentType<SvgIconProps>}
> = {
  [ToolName.FILTER]: {
    name: message('Applied Filters'),
    icon: TuneIcon,
  },
  [ToolName.RESIZE]: {
    name: message('Resized Image'),
    icon: PhotoSizeSelectLargeIcon,
  },
  [ToolName.CROP]: {
    name: message('Cropped Image'),
    icon: CropIcon,
  },
  [ToolName.DRAW]: {
    name: message('Added Drawing'),
    icon: DrawIcon,
  },
  [ToolName.TEXT]: {
    name: message('Added Text'),
    icon: TextFieldsIcon,
  },
  [ToolName.SHAPES]: {
    name: message('Added Shape'),
    icon: ExtensionIcon,
  },
  [ToolName.STICKERS]: {
    name: message('Added Sticker'),
    icon: FaceIcon,
  },
  [ToolName.FRAME]: {
    name: message('Added Frame'),
    icon: FilterFramesIcon,
  },
  [ToolName.MERGE]: {
    name: message('Merged Objects'),
    icon: MergeIcon,
  },
  [ToolName.CORNERS]: {
    name: message('Rounded Corner'),
    icon: RoundedCornerIcon,
  },
  bgImage: {
    name: message('Replaced Background Image'),
    icon: PhotoLibraryIcon,
  },
  overlayImage: {
    name: message('Added Image'),
    icon: PhotoLibraryIcon,
  },
  initial: {name: message('Initial'), icon: HomeIcon},
  loadedState: {
    name: message('Loaded State'),
    icon: HistoryIcon,
  },
  objectStyle: {
    name: message('Changed Style'),
    icon: StyleIcon,
  },
  deletedObject: {
    name: message('Deleted object'),
    icon: DeleteIcon,
  },
};

export type HistoryName =
  | ToolName
  | 'initial'
  | 'loadedState'
  | 'bgImage'
  | 'overlayImage'
  | 'objectStyle'
  | 'deletedObject';
