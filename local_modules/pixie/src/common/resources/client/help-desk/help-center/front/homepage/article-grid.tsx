import {useSettings} from '@ui/settings/use-settings';
import React, {Fragment} from 'react';
import {Trans} from '@ui/i18n/trans';
import {LandingPageData} from '@common/help-desk/help-center/front/homepage/use-landing-page';
import {
  Category,
  Section,
} from '@common/help-desk/help-center/front/categories/category';
import {ArticleLink} from '@common/help-desk/help-center/front/articles/article-link';
import {Link} from 'react-router-dom';
import clsx from 'clsx';
import {LinkStyle} from '@ui/buttons/external-link';
import {EastIcon} from '@ui/icons/material/East';
import {ArticleIcon} from '@ui/icons/material/Article';
import {
  CategoryLink,
  getCategoryLink,
} from '@common/help-desk/help-center/front/categories/category-link';
import {MixedImage} from '@ui/images/mixed-image';

interface Props {
  data: LandingPageData;
}
export function ArticleGrid({data}: Props) {
  return (
    <Fragment>
      {data.categories.map((category, index) => (
        <CategoryRow
          key={category.id}
          category={category}
          isFirst={index === 0}
        />
      ))}
    </Fragment>
  );
}

interface CategoryProps {
  category: Category;
  isFirst: boolean;
}
function CategoryRow({category, isFirst}: CategoryProps) {
  const {landing} = useSettings();
  if (!category.sections?.length) {
    return null;
  }
  return (
    <div className={clsx(!isFirst && 'mt-60')}>
      {category.name && (
        <h2
          className={clsx(
            'flex items-center gap-10 whitespace-nowrap text-xl md:text-3xl',
            category.image && 'mb-6',
          )}
        >
          {category.image && (
            <MixedImage src={category.image} className="h-30 w-30 rounded" />
          )}
          <CategoryLink category={category} />
        </h2>
      )}
      {category.description && (
        <p className="mt-4 text-sm text-muted">{category.description}</p>
      )}
      <div className="mt-34 grid grid-cols-2 gap-60 md:grid-cols-3">
        {category.sections?.map(section => {
          if (landing?.hide_small_categories && section.articles!.length < 2) {
            return null;
          }
          return <ArticleGridItem key={section.id} section={section} />;
        })}
      </div>
    </div>
  );
}

interface ArticleGridItemProps {
  section: Section;
}
function ArticleGridItem({section}: ArticleGridItemProps) {
  return (
    <div>
      {section.name && (
        <h3 className="lex mb-16 items-center gap-4 border-b pb-4 text-xl">
          {section.image && <MixedImage src={section.image} />}
          <CategoryLink category={section} />
        </h3>
      )}
      {section.articles?.map(article => (
        <div
          key={article.id}
          className="mt-14 flex items-center gap-8 text-muted"
        >
          <ArticleIcon />
          <ArticleLink
            className="block text-sm"
            article={article}
            section={section}
          />
        </div>
      ))}
      {section.articles_count! > section.articles?.length! && (
        <div className="mt-14 flex items-center gap-8">
          <Link
            to={getCategoryLink(section)}
            className={clsx('block text-sm', LinkStyle)}
          >
            <Trans
              message="See all :count articles"
              values={{count: section.articles_count}}
            />
          </Link>
          <EastIcon size="xs" className="text-primary" />
        </div>
      )}
    </div>
  );
}
