import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {domAnimation, LazyMotion} from 'framer-motion';
import {queryClient} from '@common/http/query-client';
import {SiteConfigContext} from '@common/core/settings/site-config-context';
import {SiteConfig} from '@app/site-config';
import deepMerge from 'deepmerge';
import {BaseSiteConfig} from '@common/core/settings/base-site-config';
import {ThemeProvider} from '@common/core/theme-provider';

interface ProvidersProps {
  children: any;
}

const mergedConfig = deepMerge(BaseSiteConfig, SiteConfig);

export function CommonProvider({children}: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation}>
        <SiteConfigContext.Provider value={mergedConfig}>
          <ThemeProvider>{children}</ThemeProvider>
        </SiteConfigContext.Provider>
      </LazyMotion>
    </QueryClientProvider>
  );
}
