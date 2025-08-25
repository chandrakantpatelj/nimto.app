'use client';

import { BarChart3, Filter, Plus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ApplicationAdminEventContent() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return <h3>application admin event data</h3>;
}

