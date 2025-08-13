import {
  ArticlePageNavItem,
  GetArticleResponse,
  useArticle,
} from '../use-article';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {PageStatus} from '@common/http/page-status';
import {Trans} from '@ui/i18n/trans';
import {HcSidenav} from '@common/help-desk/help-center/front/articles/hc-sidenav';
import {UseQueryResult} from '@tanstack/react-query';
import {Link, useLocation} from 'react-router-dom';
import clsx from 'clsx';
import {ArticleAttachments} from '@common/help-desk/help-center/front/articles/article-attachments';
import {ArticlePageLayout} from '@common/help-desk/help-center/front/articles/article-page/article-page-layout';
import {Skeleton} from '@ui/skeleton/skeleton';
import {AnimatePresence, m} from 'framer-motion';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {LinkStyle} from '@ui/buttons/external-link';
import {useSettings} from '@ui/settings/use-settings';
import {ArticlePageBreadcrumb} from '@common/help-desk/help-center/front/articles/article-page/article-page-breadcrumb';
import {ArticlePageFeedback} from '@common/help-desk/help-center/front/articles/article-page/article-page-feedback';
import {highlightAllCode} from '@common/text-editor/highlight/highlight-code';
import {useAuth} from '@common/auth/use-auth';
import {IconButton} from '@ui/buttons/icon-button';
import {EditIcon} from '@ui/icons/material/Edit';
import {getEditArticleLink} from '@common/help-desk/help-center/front/articles/article-link';

export function ArticlePage() {
  const query = useArticle('articlePage');
  const {hash} = useLocation();

  useEffect(() => {
    if (hash && query.data?.article) {
      setTimeout(() => {
        if (document.documentElement.scrollTop === 0) {
          const el = document.getElementById(hash.slice(1));
          if (el) {
            el.scrollIntoView({behavior: 'smooth'});
          }
        }
      });
    }
  }, [query.data, hash]);

  return (
    <ArticlePageLayout
      leftSidenav={<HcSidenav sections={query.data?.categoryNav} />}
      rightSidenav={<RightSidenav nav={query.data?.pageNav} />}
      categoryId={query.data?.article.path?.[0].id}
    >
      <AnimatePresence initial={false} mode="sync">
        <PageContent query={query} />
      </AnimatePresence>
    </ArticlePageLayout>
  );
}

interface RightSidenavProps {
  nav?: ArticlePageNavItem[];
}
function RightSidenav({nav}: RightSidenavProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  useEffect(() => {
    if (!nav) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const el = document.getElementById(`to-${entry.target.id}`);
          if (el && entry.isIntersecting) {
            setActiveItem(el.id.replace(/^to-/, ''));
          }
        }
      },
      {
        rootMargin: '0px 0px -50% 0px',
      },
    );

    const headings = nav
      .map(item => document.getElementById(item.slug))
      .filter(Boolean) as HTMLElement[];

    headings.forEach(heading => {
      observer.observe(heading);
    });

    return () => {
      headings.forEach(heading => observer.unobserve(heading));
    };
  }, [nav]);

  return (
    <div className="dashboard-grid-sidenav-right compact-scrollbar hidden w-224 xl:flex xl:w-288">
      <nav className="sticky top-64 h-[calc(100dvh-64px)] w-full py-64 pr-32 xl:pr-64">
        <h2 className="font-display text-sm font-medium">
          <Trans message="On this page" />
        </h2>
        <ol role="list" className="mt-16 space-y-12 text-sm text-muted">
          {nav?.map(item => {
            const isActive = item.slug === activeItem;
            return (
              <li key={item.slug} className={item.indent ? 'pl-20' : 'mt-8'}>
                <Link
                  className={clsx(
                    'cursor-pointer',
                    isActive ? 'text-primary' : 'hover:text-main',
                  )}
                  to={`#${item.slug}`}
                  id={`to-${item.slug}`}
                  onClick={e => {
                    const el = document.getElementById(item.slug);
                    if (el) {
                      setActiveItem(item.slug);
                      el.scrollIntoView({behavior: 'smooth'});
                    }
                  }}
                >
                  {item.display_name}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

interface PageContentProps {
  query: UseQueryResult<GetArticleResponse>;
}
function PageContent({query}: PageContentProps) {
  const settings = useSettings();
  const {hasPermission, hasRole} = useAuth();
  if (query.data && !query.isPlaceholderData) {
    const canEdit =
      hasPermission('articles.update') ||
      (query.data.article.managed_by_role &&
        hasRole(query.data.article.managed_by_role));
    return (
      <Fragment>
        <PageMetaTags query={query} />
        <m.article key="article" {...opacityAnimation}>
          <header className="mb-36">
            <ArticlePageBreadcrumb data={query.data} className="-ml-6" />
            <div className="mt-4 flex items-center gap-4">
              <h1 className="font-display text-slate-900 text-3xl tracking-tight">
                {query.data.article.title}
              </h1>
              {canEdit && (
                <IconButton
                  className="text-muted"
                  elementType={Link}
                  to={getEditArticleLink(query.data.article)}
                >
                  <EditIcon />
                </IconButton>
              )}
            </div>
          </header>
          <ArticleBody body={query.data.article.body} />
          <ArticleAttachments article={query.data.article} />
        </m.article>
        {!settings.article?.hide_new_ticket_link && (
          <div className="my-50 border-y py-50">
            <Trans
              message="Have more questions? <a>Submit a request</a>"
              values={{
                a: label => (
                  <Link className={LinkStyle} to="/hc/tickets/new">
                    {label}
                  </Link>
                ),
              }}
            />
          </div>
        )}
        <ArticlePageFeedback />
      </Fragment>
    );
  }

  return (
    <PageStatus
      query={query}
      show404={false}
      delayedSpinner={false}
      loader={
        <m.div key="skeletons" {...opacityAnimation}>
          <Skeleton variant="rect" className="h-20 max-w-580" />
          <Skeleton variant="rect" className="mb-30 mt-10 h-34 max-w-440" />
          <Skeleton className="max-w-[95%]" />
          <Skeleton />
          <Skeleton className="mb-30 max-w-[70%]" />
          <Skeleton className="max-w-[90%]" />
          <Skeleton className="max-w-[80%]" />
          <Skeleton className="max-w-[30%]" />
        </m.div>
      }
    />
  );
}

interface ArticleBodyProps {
  body: string;
}
function ArticleBody({body}: ArticleBodyProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current) {
      highlightAllCode(bodyRef.current);
    }
  }, []);
  return (
    <div className="prose-headings:font-display prose-pre:bg-slate-900 prose max-w-none dark:prose-invert prose-headings:scroll-mt-112 prose-headings:font-normal prose-a:font-normal prose-a:text-primary prose-pre:rounded-xl prose-pre:shadow-lg dark:prose-pre:shadow-none dark:prose-pre:ring-1 dark:prose-pre:ring-divider lg:prose-headings:scroll-mt-136">
      <div
        ref={bodyRef}
        className="article-body whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{__html: body}}
      />
    </div>
  );
}
