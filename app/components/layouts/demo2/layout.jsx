'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useBodyClass } from '@/hooks/use-body-class';
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

export function Demo2Layout({ children }) {
  const pathname = usePathname();
  const { setOption } = useSettings();

  useEffect(() => {
    // Set current layout
    setOption('layout', 'demo2');
  }, [setOption]);

  useBodyClass(`
    [--header-height-default:100px]  
    data-[sticky-header=on]:[--header-height:60px]
    [--header-height:var(--header-height-default)]	
  `);

  const [date, setDate] = useState({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  return (
    <>
      <div className="flex grow flex-col in-data-[sticky-header=on]:pt-(--header-height-default)">
        <Header />

        <Navbar />

        <main className="grow" role="content">
          {!pathname.includes('/public-profile/') &&
            !pathname.includes('/user-management') &&
            !pathname.includes('/store-client') && (
              <Toolbar>
                <ToolbarHeading />
                <ToolbarActions>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button mode="input" variant="outline">
                        <CalendarDays />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, 'LLL dd, y')} -{' '}
                              {format(date.to, 'LLL dd, y')}
                            </>
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
                        initialFocus
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
        </main>

        <Footer />
      </div>
    </>
  );
}
