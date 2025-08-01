'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { Download, MessageSquareDot, Search } from 'lucide-react';
import { useBodyClass } from '@/hooks/use-body-class';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { StoreClientTopbar } from '@/app/(protected)/store-client/components/common/topbar';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

export function Demo4Layout({ children }) {
  const pathname = usePathname();
  const { setOption } = useSettings();
  const isMobileMode = useIsMobile();

  // Using the custom hook to set multiple CSS variables and class properties
  useBodyClass(`
    [--header-height:60px] 
    [--sidebar-width:290px] 
    lg:overflow-hidden 
    bg-muted!
  `);

  useEffect(() => {
    setOption('layout', 'demo4');
  }, [setOption]);

  return (
    <>
      <div className="flex grow">
        {isMobileMode && <Header />}

        <div className="flex flex-col lg:flex-row grow pt-(--header-height) lg:pt-0">
          {!isMobileMode && <Sidebar />}

          <div className="flex grow rounded-xl bg-background border border-input lg:ms-(--sidebar-width) mt-0 lg:mt-5 m-5">
            <div className="flex flex-col grow kt-scrollable-y-auto lg:[--kt-scrollbar-width:auto] pt-5">
              <main className="grow" role="content">
                {!pathname.includes('/user-management') && (
                  <Toolbar>
                    <ToolbarHeading />
                    <ToolbarActions>
                      <>
                        {pathname.startsWith('/store-client') ? (
                          <StoreClientTopbar />
                        ) : (
                          <>
                            <SearchDialog
                              trigger={
                                <Button
                                  variant="ghost"
                                  mode="icon"
                                  className="hover:[&_svg]:text-primary"
                                >
                                  <Search className="size-4.5!" />
                                </Button>
                              }
                            />

                            <NotificationsSheet
                              trigger={
                                <Button
                                  variant="ghost"
                                  mode="icon"
                                  className="hover:[&_svg]:text-primary"
                                >
                                  <MessageSquareDot className="size-4.5!" />
                                </Button>
                              }
                            />

                            <Button
                              variant="outline"
                              className="hover:[&_svg]:text-primary hover:text-primary ms-2.5 "
                              asChild
                            >
                              <Link href={'/account/home/get-started'}>
                                <Download />
                                Export
                              </Link>
                            </Button>
                          </>
                        )}
                      </>
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
}
