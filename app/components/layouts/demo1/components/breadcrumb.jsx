'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';

export function Breadcrumb() {
  const pathname = usePathname();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const items = getBreadcrumb(MENU_SIDEBAR);

  if (items.length === 0) {
    return null;
  }

  // Get the main module title (first item in breadcrumb)
  const mainModuleTitle = items[0]?.title || '';

  return (
    <div className="flex items-center text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
      <span className="text-mono">
        {mainModuleTitle}
      </span>
    </div>
  );
}
