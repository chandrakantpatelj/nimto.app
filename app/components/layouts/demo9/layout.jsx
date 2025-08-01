'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { CalendarDays, Download } from 'lucide-react';
import { useBodyClass } from '@/hooks/use-body-class';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Navbar } from './components/navbar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

export function Demo9Layout({ children }) {
  const { setOption } = useSettings();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const [date, setDate] = useState({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  useBodyClass(`
    [--header-height:78px]
    bg-background!
  `);

  useEffect(() => {
    setOption('layout', 'demo9');
  }, [setOption]);

  return (
    <>
      <div className="flex grow flex-col in-data-[sticky-header=on]:pt-(--header-height)">
        <Header />

        {!isMobile && <Navbar />}

        <main className="flex flex-col grow pt-7" role="content">
          {!pathname.includes('/public-profile/') &&
            !pathname.includes('/user-management') &&
            !pathname.includes('/store-client') && (
              <Toolbar>
                <ToolbarHeading />

                <ToolbarActions>
                  <Button variant="outline" asChild>
                    <Link href={'/account/home/get-started'}>
                      <Download />
                      Export
                    </Link>
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="date" variant="outline">
                        <CalendarDays />
                        {date?.from ? (
                          date.to ? (
                            <span>
                              {format(date.from, 'LLL dd, y')} -{' '}
                              {format(date.to, 'LLL dd, y')}
                            </span>
                          ) : (
                            format(date.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </ToolbarActions>
              </Toolbar>
            )}

          {children}

          <Footer />
        </main>
      </div>
    </>
  );
}
