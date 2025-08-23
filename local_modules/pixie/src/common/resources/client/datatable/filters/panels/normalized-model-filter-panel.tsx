import {FilterPanelProps} from './filter-panel-props';
import {FormNormalizedModelField} from '@common/ui/normalized-model/normalized-model-field';
import {FilterSelectModelControl} from '@common/datatable/filters/backend-filter';

export function NormalizedModelFilterPanel({
  filter,
}: FilterPanelProps<FilterSelectModelControl>) {
  return (
    <FormNormalizedModelField
      name={`${filter.key}.value`}
      endpoint={`normalized-models/${filter.control.model}`}
    />
  );
}
