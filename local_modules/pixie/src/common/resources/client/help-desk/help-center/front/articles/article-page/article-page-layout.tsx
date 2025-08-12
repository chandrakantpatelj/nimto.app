import React, {ReactElement, ReactNode} from 'react';
import {DashboardLayout} from '@common/ui/dashboard-layout/dashboard-layout';
import {DashboardNavbar} from '@common/ui/dashboard-layout/dashboard-navbar';
import {DashboardContent} from '@common/ui/dashboard-layout/dashboard-content';
import {DashboardSidenav} from '@common/ui/dashboard-layout/dashboard-sidenav';
import {HcSearchBar} from '@common/help-desk/help-center/front/search/hc-search-bar';

interface Props {
  children: ReactNode;
  leftSidenav: ReactElement;
  rightSidenav?: ReactNode;
  categoryId?: number;
}
export function ArticlePageLayout({
  children,
  leftSidenav,
  rightSidenav,
  categoryId,
}: Props) {
  return (
    <DashboardLayout
      height="h-auto"
      gridClassName="hc-grid"
      name="hc-article"
      blockBodyOverflow={false}
    >
      <DashboardNavbar
        menuPosition="header"
        className="sticky top-0 z-10 flex-shrink-0"
        size="md"
      >
        <HcSearchBar categoryId={categoryId} />
      </DashboardNavbar>
      <DashboardSidenav
        position="left"
        size="w-auto"
        overflow="overflow-initial"
        className="justify-end bg-alt"
      >
        {leftSidenav}
      </DashboardSidenav>
      <DashboardContent isScrollable={false}>
        <div className="min-w-0 max-w-672 px-16 py-16 md:py-64 lg:max-w-none lg:px-32 xl:px-64">
          {children}
        </div>
      </DashboardContent>
      {rightSidenav}
    </DashboardLayout>
  );
}
