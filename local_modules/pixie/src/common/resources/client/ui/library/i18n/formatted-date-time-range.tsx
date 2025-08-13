import {DateValue, parseAbsolute} from '@internationalized/date';
import {Fragment, memo} from 'react';
import {useDateFormatter} from '@ui/i18n/use-date-formatter';
import {useSettings} from '@ui/settings/use-settings';
import {shallowEqual} from '@ui/utils/shallow-equal';
import {useUserTimezone} from '@ui/i18n/use-user-timezone';
import {DateFormatPresets} from '@ui/i18n/formatted-date';

interface FormattedDateTimeRangeProps {
  start?: string | DateValue | Date;
  end?: string | DateValue | Date;
  options?: Intl.DateTimeFormatOptions;
  preset?: keyof typeof DateFormatPresets;
}
export const FormattedDateTimeRange = memo(
  ({start, end, options, preset}: FormattedDateTimeRangeProps) => {
    const {dates} = useSettings();
    const timezone = useUserTimezone();
    const formatter = useDateFormatter(
      options ||
        (DateFormatPresets as Record<string, Intl.DateTimeFormatOptions>)[
          preset || dates?.format
        ],
    );

    if (!start || !end) {
      return null;
    }

    let value: string;

    try {
      value = formatter.formatRange(
        castToDate(start, timezone),
        castToDate(end, timezone),
      );
    } catch (e) {
      value = '';
    }

    return <Fragment>{value}</Fragment>;
  },
  shallowEqual,
);

function castToDate(date: string | DateValue | Date, timezone: string): Date {
  if (typeof date === 'string') {
    return parseAbsolute(date, timezone).toDate();
  }
  if ('toDate' in date) {
    return date.toDate(timezone);
  }
  return date;
}
