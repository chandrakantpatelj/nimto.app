'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';

// Update: Removed max-w from 'fluid' and made it the default
const containerVariants = cva('w-full mx-auto px-4 lg:px-6', {
  variants: {
    width: {
      fixed: 'max-w-[1320px]',
      fluid: '', // full width, no max-w
    },
  },
  defaultVariants: {
    width: 'fluid', // default to full width
  },
});

export function Container({ children, width, className = '' }) {
  const { settings } = useSettings();

  // fallback to global settings or default to fluid (full width)
  const effectiveWidth = width ?? settings.container ?? 'fluid';

  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ width: effectiveWidth }), className)}
    >
      {children}
    </div>
  );
}
