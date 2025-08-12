import {m} from 'framer-motion';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {Skeleton} from '@ui/skeleton/skeleton';
import React from 'react';

export function FilterListSkeleton() {
  return (
    <m.div
      className="flex h-30 items-center gap-6"
      key="filter-list-skeleton"
      {...opacityAnimation}
    >
      <Skeleton variant="rect" size="h-full w-144" radius="rounded-md" />
      <Skeleton variant="rect" size="h-full w-112" radius="rounded-md" />
      <Skeleton variant="rect" size="h-full w-172" radius="rounded-md" />
    </m.div>
  );
}
