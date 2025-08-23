import React, {useMemo} from 'react';
import {Article} from '@common/help-desk/help-center/front/articles/article';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Link} from 'react-router-dom';
import {Section} from '@common/help-desk/help-center/front/categories/category';
import clsx from 'clsx';
import {slugifyString} from '@ui/utils/string/slugify-string';

interface Props extends React.HTMLAttributes<HTMLAnchorElement> {
  article: Article;
  children?: React.ReactNode;
  section?: Section;
  className?: string;
  target?: string;
}
export function ArticleLink({
  article,
  children,
  section,
  className,
  target,
  ...linkProps
}: Props) {
  const link = useMemo(() => {
    return getArticleLink(article, {section});
  }, [article, section]);

  return (
    <Link
      className={clsx(
        'overflow-hidden overflow-ellipsis text-inherit outline-none transition-colors hover:underline focus-visible:underline',
        className,
      )}
      to={link}
      target={target}
      {...linkProps}
    >
      {children ?? article.title}
    </Link>
  );
}

interface Options {
  absolute?: boolean;
  section?: Section;
}
export function getArticleLink(
  article: {id: number; slug?: string; title: string; path?: Article['path']},
  {absolute, section}: Options = {},
): string {
  if (!section && article.path?.length) {
    section = article.path[1];
  }
  let link = `/hc/articles/${section?.parent_id}/${section?.id}/${article.id}/${
    article.slug ?? slugifyString(article.title)
  }`;

  if (absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}

export function getEditArticleLink(article: Article) {
  if (article.path?.length === 2) {
    return `../../hc/arrange/sections/${article.path[1].id}/articles/${article.id}/edit`;
  }
  return `../../articles/${article.id}/edit`;
}
