import {Article} from '@common/help-desk/help-center/front/articles/article';
import {CategoryLink} from '@common/help-desk/help-center/front/categories/category-link';
import {ReactNode} from 'react';

interface Props {
  article: {path?: Article['path']};
  className?: string;
  noLinks?: boolean;
}
export function ArticlePath({article, className, noLinks}: Props) {
  if (!article.path?.length) {
    return null;
  }

  let category: ReactNode;
  let section: ReactNode;

  if (article.path[0]) {
    category = noLinks ? (
      article.path[0].name
    ) : (
      <CategoryLink category={article.path[0]} />
    );
  }

  if (article.path[1]) {
    section = noLinks ? (
      article.path[1].name
    ) : (
      <CategoryLink category={article.path[1]} />
    );
  }

  const showSeparator = !!category && !!section;

  return (
    <div className={className}>
      {category} {showSeparator && '/'} {section}
    </div>
  );
}
