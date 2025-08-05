'use client';

import Link from 'next/link';

export function SidebarHeader() {

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-center px-3 lg:px-6 shrink-0">
      <Link href="/" className="text-2xl font-bold text-primary">
        Nimto
      </Link>
    </div>
  );
}
