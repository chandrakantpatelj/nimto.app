import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import React from 'react';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {
  Category,
  Section,
} from '@common/help-desk/help-center/front/categories/category';

interface Props {
  category?: Category;
  section?: Section;
}
export function HcManagerBreadcrumb({category, section}: Props) {
  const navigate = useNavigate();
  if (!category && !section) return null;
  return (
    <Breadcrumb size="sm" className="-mx-8">
      <BreadcrumbItem onSelected={() => navigate('../../hc/arrange')}>
        <Trans message="Categories" />
      </BreadcrumbItem>
      {category && (
        <BreadcrumbItem
          className={!section ? 'text-primary' : undefined}
          onSelected={() =>
            navigate(`../../hc/arrange/categories/${category.id}`)
          }
        >
          <Trans message={category.name} />
        </BreadcrumbItem>
      )}
      {section && (
        <BreadcrumbItem className="text-primary">
          <Trans message={section.name} />
        </BreadcrumbItem>
      )}
    </Breadcrumb>
  );
}
