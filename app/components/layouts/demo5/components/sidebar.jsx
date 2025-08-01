'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenuDashboard } from './sidebar-menu-dashboard';
import { SidebarMenuDefault } from './sidebar-menu-default';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex items-stretch shrink-0 px-2 w-(--sidebar-width) bg-background">
      {pathname === '/' ? <SidebarMenuDashboard /> : <SidebarMenuDefault />}
    </div>
  );
}
