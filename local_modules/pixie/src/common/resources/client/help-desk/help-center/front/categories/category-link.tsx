import React, {useMemo} from 'react';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Link} from 'react-router-dom';
import {slugifyString} from '@ui/utils/string/slugify-string';
import {
  Category,
  Section,
} from '@common/help-desk/help-center/front/categories/category';
import clsx from 'clsx';

interface Props extends React.HTMLAttributes<HTMLAnchorElement> {
  category: Category | Section;
  children?: React.ReactNode;
  className?: string;
  target?: string;
}
export function CategoryLink({
  category,
  children,
  className,
  ...linkProps
}: Props) {
  const link = useMemo(() => {
    return getCategoryLink(category);
  }, [category]);

  return (
    <Link
      className={clsx(
        'overflow-hidden overflow-ellipsis text-inherit outline-none transition-colors hover:underline focus-visible:underline',
        className,
      )}
      to={link}
      {...linkProps}
    >
      {children ?? category.name}
    </Link>
  );
}

interface Options {
  absolute?: boolean;
}
export function getCategoryLink(
  category: Category | Section,
  {absolute}: Options = {},
): string {
  let link = category.is_section
    ? `/hc/categories/${category.parent_id}/${category.id}/${slugifyString(
        category.name,
      )}`
    : `/hc/categories/${category.id}/${slugifyString(category.name)}`;

  if (absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}
