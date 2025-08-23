import {
  BackendFilter,
  FilterControlType,
  FilterOperator,
} from '@common/datatable/filters/backend-filter';
import {message} from '@ui/i18n/message';
import {
  createdAtFilter,
  updatedAtFilter,
} from '@common/datatable/filters/timestamp-filters';
import {USER_MODEL} from '@ui/types/user';

export const ArticleDatatableFilters: BackendFilter[] = [
  {
    key: 'draft',
    label: message('Published'),
    description: message('Whether article is published or draft'),
    defaultOperator: FilterOperator.eq,
    control: {
      type: FilterControlType.BooleanToggle,
      defaultValue: true,
    },
  },
  {
    key: 'author_id',
    label: message('Author'),
    description: message('User this article was created by'),
    defaultOperator: FilterOperator.eq,
    control: {
      type: FilterControlType.SelectModel,
      model: USER_MODEL,
    },
  },
  createdAtFilter({
    description: message('Date article was created'),
  }),
  updatedAtFilter({
    description: message('Date article was last updated'),
  }),
];
