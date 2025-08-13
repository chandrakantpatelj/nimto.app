import {
  LocationDatasetItem,
  ReportMetric,
} from '@common/admin/analytics/report-metric';
import React, {useMemo, useRef} from 'react';
import {useGoogleGeoChart} from './use-google-geo-chart';
import {ChartLayout, ChartLayoutProps} from '@common/charts/chart-layout';
import {ChartLoadingIndicator} from '@common/charts/chart-loading-indicator';
import {Button} from '@ui/buttons/button';
import {ArrowBackIcon} from '@ui/icons/material/ArrowBack';
import clsx from 'clsx';
import {InfoDialogTrigger} from '@ui/overlays/dialog/info-dialog-trigger/info-dialog-trigger';
import {Trans} from '@ui/i18n/trans';
import {FormattedCountryName} from '@ui/i18n/formatted-country-name';

interface GeoChartData extends Partial<ChartLayoutProps> {
  data?: ReportMetric<LocationDatasetItem>;
  onCountrySelected?: (countryCode: string | undefined) => void;
  country?: string;
}
export function GeoChart({
  data: metricData,
  isLoading,
  onCountrySelected,
  country,
  ...layoutProps
}: GeoChartData) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const regionInteractivity = !!onCountrySelected;

  // memo data to avoid redrawing chart on rerender
  const initialData = metricData?.datasets[0].data;
  const data = useMemo(() => {
    return initialData || [];
  }, [initialData]);
  useGoogleGeoChart({placeholderRef, data, country, onCountrySelected});

  return (
    <ChartLayout
      {...layoutProps}
      className="min-w-500"
      title={
        <div className="flex items-center">
          <Trans message="Top Locations" />
          {country ? (
            <span className="pl-4">
              ({<FormattedCountryName code={country} />})
            </span>
          ) : null}
          {regionInteractivity && <InfoTrigger />}
        </div>
      }
      contentIsFlex={isLoading}
    >
      {isLoading && <ChartLoadingIndicator />}
      <div className="flex gap-24">
        <div
          ref={placeholderRef}
          className="min-h-[340px] w-[480px] flex-auto"
        />
        <div className="w-[170px]">
          <div className="max-h-[340px] w-full flex-initial overflow-y-auto text-sm">
            {data.map(location => (
              <div
                key={location.label}
                className={clsx(
                  'mb-4 flex items-center gap-4',
                  regionInteractivity && 'cursor-pointer hover:underline',
                )}
                role={regionInteractivity ? 'button' : undefined}
                onClick={() => {
                  onCountrySelected?.(location.code);
                }}
              >
                <div className="max-w-110 overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {location.label}
                </div>
                <div>({location.percentage})%</div>
              </div>
            ))}
          </div>
          {country && (
            <Button
              variant="outline"
              size="xs"
              className="mt-14"
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                onCountrySelected?.(undefined);
              }}
            >
              <Trans message="Back to countries" />
            </Button>
          )}
        </div>
      </div>
    </ChartLayout>
  );
}

function InfoTrigger() {
  return (
    <InfoDialogTrigger
      title={<Trans message="Zooming in" />}
      body={
        <Trans message="Click on a country inside the map or country list to zoom in and see city data for that country." />
      }
    />
  );
}
