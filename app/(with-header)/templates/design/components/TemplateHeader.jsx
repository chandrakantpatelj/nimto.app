'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/common/container';

export function TemplateHeader({ onSave, loading = false, templateName = '', onTemplateNameChange }) {
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;

  return (
    <header
      className={cn(
        'header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b  border-slate-200 bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)]',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container
        width="fluid"
        className="flex justify-between items-stretch lg:gap-4"
      >
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button variant="secondary" appearance="ghost" asChild disabled={loading}>
            <Link href="/templates">
              <ArrowLeft /> Back
            </Link>
          </Button>
          <Input
            type="text"
            value={templateName}
            onChange={onTemplateNameChange}
            disabled={loading}
            placeholder="Template name"
          />
        </div>

        <div className="flex items-center  ml-auto">
          <Button 
            variant="primary" 
            onClick={onSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Template'
            )}
          </Button>
        </div>
      </Container>
    </header>
  );
}
