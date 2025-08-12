import {HeaderDatum} from '@common/admin/analytics/use-admin-report';
import React, {
  cloneElement,
  Fragment,
  isValidElement,
  ReactElement,
} from 'react';
import {TrendingUpIcon} from '@ui/icons/material/TrendingUp';
import {TrendingDownIcon} from '@ui/icons/material/TrendingDown';
import {createSvgIconFromTree} from '@ui/icons/create-svg-icon';
import {AdminReportPageColGap} from '@common/admin/analytics/visitors-report-charts';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {FormattedBytes} from '@ui/i18n/formatted-bytes';
import {TrendingFlatIcon} from '@ui/icons/material/TrendingFlat';
import {AnimatePresence, m} from 'framer-motion';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {Skeleton} from '@ui/skeleton/skeleton';

interface AdminHeaderReportProps {
  report?: HeaderDatum[];
  isLoading?: boolean;
}
export function AdminHeaderReport({report, isLoading}: AdminHeaderReportProps) {
  return (
    <div
      className={`flex h-[97px] flex-shrink-0 items-center overflow-x-auto ${AdminReportPageColGap}`}
    >
      {report?.map(datum => (
        <ReportItem key={datum.name} datum={datum} isLoading={isLoading} />
      ))}
    </div>
  );
}

interface ValueMetricItemProps {
  datum: HeaderDatum;
  isLoading?: boolean;
}
function ReportItem({datum, isLoading = false}: ValueMetricItemProps) {
  let icon;
  if (isValidElement(datum.icon)) {
    icon = cloneElement(datum.icon, {size: 'lg'});
  } else {
    const IconEl = createSvgIconFromTree(datum.icon);
    icon = <IconEl size="lg" />;
  }

  return (
    <div
      key={datum.name}
      className="flex h-full flex-auto items-center gap-18 whitespace-nowrap rounded-panel border p-20"
    >
      <div className="flex-shrink-0 rounded-lg bg-primary-light/20 p-10 text-primary">
        {icon}
      </div>
      <div className="flex-auto">
        <div className="flex items-center justify-between gap-20">
          <div className="text-lg font-bold text-main">
            <AnimatePresence initial={false} mode="wait">
              {isLoading ? (
                <m.div key="skeleton" {...opacityAnimation}>
                  <Skeleton className="min-w-24" />
                </m.div>
              ) : (
                <m.div key="value" {...opacityAnimation}>
                  <FormattedValue datum={datum} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center justify-between gap-20">
          <h2 className="text-sm text-muted">{datum.name}</h2>
          {(datum.percentageChange != null || datum.previousValue != null) && (
            <div className="flex items-center gap-10">
              <TrendingIndicator datum={datum} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormattedValueProps {
  datum: HeaderDatum;
}
function FormattedValue({datum}: FormattedValueProps) {
  switch (datum.type) {
    case 'fileSize':
      return <FormattedBytes bytes={datum.currentValue} />;
    case 'percentage':
      return (
        <FormattedNumber
          value={datum.currentValue}
          style="percent"
          maximumFractionDigits={1}
        />
      );
    default:
      return <FormattedNumber value={datum.currentValue} />;
  }
}

interface TrendingIndicatorProps {
  datum: HeaderDatum;
}
function TrendingIndicator({datum}: TrendingIndicatorProps) {
  const percentage = calculatePercentage(datum);
  let icon: ReactElement;
  if (percentage > 0) {
    icon = <TrendingUpIcon size="md" className="text-positive" />;
  } else if (percentage === 0) {
    icon = <TrendingFlatIcon className="text-muted" />;
  } else {
    icon = <TrendingDownIcon className="text-danger" />;
  }

  return (
    <Fragment>
      {icon}
      <div className="text-sm font-semibold text-muted">{percentage}%</div>
    </Fragment>
  );
}

function calculatePercentage({
  percentageChange,
  previousValue,
  currentValue,
}: HeaderDatum) {
  if (
    percentageChange != null ||
    previousValue == null ||
    currentValue == null
  ) {
    return percentageChange ?? 0;
  }

  if (previousValue === 0) {
    return 100;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}
