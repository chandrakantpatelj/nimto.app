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
import { StoreClientTopbar } from '@/app/(protected)/store-client/components/common/topbar';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

const Demo10Layout = ({ children }) => {
  const { setOption } = useSettings();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const [date, setDate] = useState({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  useBodyClass(`
    [--header-height:60px]
    [--sidebar-width:270px]
    bg-mono! dark:bg-background!
  `);

  useEffect(() => {
    setOption('layout', 'demo10');
  }, [setOption]);

  return (
    <>
      <div className="flex grow">
        {isMobile && <Header />}

        <div className="flex flex-col lg:flex-row grow pt-(--header-height) lg:pt-0">
          {!isMobile && <Sidebar />}

          <div className="flex flex-col grow lg:rounded-s-xl bg-background border border-input lg:ms-(--sidebar-width)">
            <div className="flex flex-col grow kt-scrollable-y-auto lg:[scrollbar-width:auto] pt-5">
              <main className="grow" role="content">
                {!pathname.includes('/user-management') && (
                  <Toolbar>
                    <ToolbarHeading />
                    <ToolbarActions>
                      {pathname.startsWith('/store-client') ? (
                        <StoreClientTopbar />
                      ) : (
                        <>
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
                        </>
                      )}
                    </ToolbarActions>
                  </Toolbar>
                )}

                {children}
              </main>

              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Demo10Layout };
