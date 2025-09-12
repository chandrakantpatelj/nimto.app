import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SettingsProvider } from '@/providers/settings-provider';
import { TooltipsProvider } from '@/providers/tooltips-provider';
import { Toaster } from '@/components/ui/sonner';
import '@/css/styles.css';
import '@/components/keenicons/assets/styles.css';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { ModulesProvider } from '@/providers/modules-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ReduxProvider } from '@/providers/redux-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/providers/toast-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    template: '%s | Nimto',
    default: 'Nimto', // a default is required when creating a template
  },
};

export default async function RootLayout({ children }) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased flex h-full text-base text-foreground bg-background',
          inter.className,
        )}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <QueryProvider>
            <AuthProvider>
              <SettingsProvider>
                <ThemeProvider>
                  <I18nProvider>
                    <TooltipsProvider>
                      <ModulesProvider>
                        <ToastProvider>
                          <Suspense>{children}</Suspense>
                          <Toaster />
                        </ToastProvider>
                      </ModulesProvider>
                    </TooltipsProvider>
                  </I18nProvider>
                </ThemeProvider>
              </SettingsProvider>
            </AuthProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
