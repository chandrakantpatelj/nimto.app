import {StaticPageTitle} from '@common/seo/static-page-title';
import {Trans} from '@ui/i18n/trans';
import {PageStatus} from '@common/http/page-status';
import React, {ReactElement, ReactNode} from 'react';
import {UseQueryResult} from '@tanstack/react-query';

interface Props<T> {
  actionButton?: ReactNode;
  query: UseQueryResult<T>;
  children: (data: T) => ReactElement;
}
export function HcManagerLayout<T>({actionButton, query, children}: Props<T>) {
  return (
    <div className="p-12 md:p-24">
      <div className="mb-18">
        <StaticPageTitle>
          <Trans message="Help center" />
        </StaticPageTitle>
        <div className="items-end justify-between gap-24 md:flex">
          <div>
            <h1 className="text-3xl font-light">
              <Trans message="Help center" />
            </h1>
            <p className="mt-2 text-sm text-muted">
              <Trans message="Arrange help center categories, sections and articles." />
            </p>
          </div>
          <div className="max-md:mt-12">{actionButton}</div>
        </div>
      </div>
      <main>
        {query.data ? (
          children(query.data)
        ) : (
          <PageStatus query={query} loaderClassName="absolute inset-0 m-auto" />
        )}
      </main>
    </div>
  );
}
