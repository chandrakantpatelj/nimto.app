'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';

export function TemplateHeader({ activeStep, handleNext, handleBack }) {
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;

  return (
    <header
      className={cn(
        'header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b  border-slate-200 bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)] py-2',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container className="flex justify-between items-stretch lg:gap-4">
        <div className="flex items-center ">
          {activeStep === 0 && (
            <div className="flex flex-col gap-1 ">
              <span className="text-md font-semibold ">
                Step 1: Design Invitation
              </span>
              <span className="text-xs font-medium text-secondary-foreground">
                Customize the look and fill in event details.
              </span>
            </div>
          )}
          {activeStep === 1 && (
            <div className="flex flex-col gap-1 ">
              <span className="text-md font-semibold ">Step 2: Preview</span>
              <span className="text-xs font-medium text-secondary-foreground">
                See how your invitation will look to guests.
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-1 items-center py-2 ml-auto">
          <Button variant="outline" asChild>
            <Link href="/host/events">Cancel</Link>
          </Button>
          <span className="bg-gray-200 w-[1px] h-full mx-1"></span>
          <div className="flex  gap-1 ">
            {activeStep > 0 && (
              <Button
                variant="outline"
                mode="primary"
                onClick={() => handleBack()}
              >
                Previous
              </Button>
            )}

            <Button variant="primary" onClick={() => handleNext()}>
              Next
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
