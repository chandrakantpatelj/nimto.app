import {useSettings} from '@ui/settings/use-settings';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {LandingPagePattern} from '@common/help-desk/help-center/front/homepage/landing-page-pattern';
import {Trans} from '@ui/i18n/trans';
import React from 'react';
import {useLandingPageHeaderBackground} from '@common/help-desk/help-center/front/homepage/use-landing-page-header-background';

export function SimpleHeader() {
  const {landing} = useSettings();
  const config = landing?.header;
  const cssProps = useLandingPageHeaderBackground();
  return (
    <div className="mb-20 md:mb-40" style={cssProps}>
      <Navbar
        menuPosition="header"
        color="bg-background/50"
        darkModeColor="bg-background/30"
        logoColor="dark"
        wrapInContainer
        className="relative z-10 border-b"
      />
      <div className="container mx-auto px-14 md:px-24">
        {!cssProps && <LandingPagePattern blur />}
        <div className="relative z-10 mt-24 border-b pb-20 md:mt-50 md:pb-30">
          {config?.title && (
            <h1 className="text-4xl md:text-5xl">
              <Trans message={config?.title} />
            </h1>
          )}
          {config?.subtitle && (
            <p className="mt-12 text-base md:text-xl">
              <Trans message={config?.subtitle} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
