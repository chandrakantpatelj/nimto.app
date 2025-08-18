'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/common/container';

export function TemplateHeader() {
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;

  return (
    <header
      className={cn(
        'header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b  border-slate-200 bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)] py-2',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container
        width="fluid"
        className="flex justify-between items-stretch lg:gap-4"
      >
        <div className="flex items-center ">
          <div className="flex flex-col gap-1 ">
            <span className="text-md font-semibold ">
              Step 1: Design Invitation
            </span>
            <span className="text-xs font-medium text-secondary-foreground">
              Customize the look and fill in event details.
            </span>
          </div>
        </div>

        <div className="flex gap-1 items-center py-2 ml-auto">
          <Button variant="outline" asChild>
            <Link href="/host/events">Cancel</Link>
          </Button>
          <span className="bg-gray-200 w-[1px] h-full mx-1 "></span>
          <Button variant="primary">Next</Button>
        </div>
      </Container>
    </header>
  );
}
