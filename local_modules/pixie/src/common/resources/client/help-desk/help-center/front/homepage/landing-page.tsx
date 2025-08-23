import {useSettings} from '@ui/settings/use-settings';
import {MultiProductArticleGrid} from '@common/help-desk/help-center/front/homepage/multi-product-article-grid';
import {Footer} from '@common/ui/footer/footer';
import React, {ReactNode} from 'react';
import {useLandingPage} from '@common/help-desk/help-center/front/homepage/use-landing-page';
import {PageStatus} from '@common/http/page-status';
import {ArticleGrid} from '@common/help-desk/help-center/front/homepage/article-grid';
import {ColorfulHeader} from '@common/help-desk/help-center/front/homepage/colorful-header';
import {SimpleHeader} from '@common/help-desk/help-center/front/homepage/simple-header';

export function LandingPage() {
  const query = useLandingPage();
  const {landing} = useSettings();

  return (
    <Layout>
      {query.data ? (
        landing?.content?.variant === 'multiProduct' ? (
          <MultiProductArticleGrid data={query.data} />
        ) : (
          <ArticleGrid data={query.data} />
        )
      ) : (
        <PageStatus
          query={query}
          show404={false}
          delayedSpinner={false}
          loaderIsScreen={false}
        />
      )}
    </Layout>
  );
}

interface LayoutProps {
  children: ReactNode;
}
function Layout({children}: LayoutProps) {
  const {landing} = useSettings();
  return (
    <div className="isolate">
      {landing?.header?.variant === 'simple' ? (
        <SimpleHeader />
      ) : (
        <ColorfulHeader />
      )}
      <div className="container mx-auto mb-60 px-14 md:px-24">
        <main className="relative z-10 min-h-850">{children}</main>
      </div>
      {landing?.show_footer && <Footer className="px-40" />}
    </div>
  );
}
