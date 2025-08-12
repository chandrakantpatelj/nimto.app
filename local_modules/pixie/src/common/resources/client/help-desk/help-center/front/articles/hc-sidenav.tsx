import {Trans} from '@ui/i18n/trans';
import {useParams} from 'react-router-dom';
import clsx from 'clsx';
import {Fragment, useContext} from 'react';
import {IconButton} from '@ui/buttons/icon-button';
import {CloseIcon} from '@ui/icons/material/Close';
import {Logo} from '@common/ui/navigation/navbar/logo';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {ArticleLink} from '@common/help-desk/help-center/front/articles/article-link';
import {Section} from '@common/help-desk/help-center/front/categories/category';
import {usePrevious} from '@ui/utils/hooks/use-previous';

interface Props {
  sections?: Section[];
  isCompact?: boolean;
}
export function HcSidenav({sections: currentSections}: Props) {
  const {articleId} = useParams();
  const isDarkMode = useIsDarkMode();
  const {setLeftSidenavStatus} = useContext(DashboardLayoutContext);
  const prevSections = usePrevious(currentSections);
  const sections = currentSections ?? prevSections;

  return (
    <Fragment>
      <div className="stable-scrollbar sticky w-350 overflow-y-auto overflow-x-hidden py-24 pl-24 pr-32 md:h-[calc(100dvh-64px)] lg:top-64 lg:py-64 lg:pl-32 xl:pl-48 xl:pr-64">
        <div className="mb-34 flex items-center justify-between gap-8 lg:hidden">
          <Logo isDarkMode={isDarkMode} logoColor="dark" />
          <IconButton onClick={() => setLeftSidenavStatus('closed')}>
            <CloseIcon />
          </IconButton>
        </div>
        <nav className="text-base lg:text-sm">
          <ul role="list" className="space-y-36">
            {sections?.map(section => (
              <li key={section.id}>
                <h2 className="font-display font-semibold">
                  <Trans message={section.name} />
                </h2>
                <ul
                  role="list"
                  className="mt-8 space-y-8 border-l lg:mt-16 lg:space-y-16"
                >
                  {section.articles?.map(article => {
                    const isActive = `${article.id}` === articleId;
                    return (
                      <li key={article.id}>
                        <ArticleLink
                          className={clsx(
                            '-ml-1 block w-full pl-16 text-muted',
                            isActive &&
                              'border-l border-current font-semibold text-primary',
                          )}
                          article={article}
                          section={section}
                        />
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Fragment>
  );
}
