import {SerializedPixieState} from '../serialized-pixie-state';
import {HistoryItem} from '../history-item.interface';
import {getCurrentCanvasState} from './get-current-canvas-state';
import {HistoryName} from '../history-display-names';
import {randomString} from '@ui/utils/string/random-string';

export function createHistoryItem(params: {
  name: HistoryName;
  state?: SerializedPixieState;
}): HistoryItem {
  if (!params.state) {
    params.state = getCurrentCanvasState();
  }
  const state = params.state || getCurrentCanvasState();
  return {
    ...state,
    name: params.name,
    id: randomString(15),
  };
}
