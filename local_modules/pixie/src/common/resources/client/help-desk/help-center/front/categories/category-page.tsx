import React from 'react';
import {PageStatus} from '@common/http/page-status';
import {
  GetCategoryResponse,
  useCategory,
} from '@common/help-desk/help-center/front/categories/use-category';
import {ArticleIcon} from '@ui/icons/material/Article';
import {ArticlePageLayout} from '@common/help-desk/help-center/front/articles/article-page/article-page-layout';
import {ArticleLink} from '@common/help-desk/help-center/front/articles/article-link';
import {ArticlePath} from '@common/help-desk/help-center/front/articles/article-path';
import {HcSidenav} from '@common/help-desk/help-center/front/articles/hc-sidenav';
import {
  Category,
  Section,
} from '@common/help-desk/help-center/front/categories/category';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {getCategoryLink} from '@common/help-desk/help-center/front/categories/category-link';

export function CategoryPage() {
  const query = useCategory('categoryPage');
  const category = query.data?.category;

  return (
    <ArticlePageLayout
      leftSidenav={<HcSidenav sections={query.data?.categoryNav} />}
      categoryId={category?.is_section ? category.parent_id : category?.id}
    >
      {query.data ? (
        <PageContent data={query.data} />
      ) : (
        <div>
          <PageStatus query={query} loaderClassName="absolute inset-0 m-auto" />
        </div>
      )}
    </ArticlePageLayout>
  );
}

interface PageContentProps {
  data: GetCategoryResponse;
}
function PageContent({data}: PageContentProps) {
  return (
    <div>
      <header className="mb-36">
        <PageBreadcrumb category={data.category} />
        <h1 className="font-display text-3xl tracking-tight">
          {data.category.name}
        </h1>
      </header>
      {data.articles?.map(article => (
        <div
          key={article.id}
          className="mb-16 flex items-start gap-10 border-b pb-16"
        >
          <ArticleIcon size="md" className="mt-2 text-muted" />
          <div>
            <h2 className="font-display mb-2 text-xl">
              <ArticleLink article={article} />
            </h2>
            <ArticlePath article={article} className="text-sm text-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface PageBreadcrumbProps {
  category: Category | Section;
}
function PageBreadcrumb({category}: PageBreadcrumbProps) {
  const navigate = useNavigate();
  const categories = [category];
  if (category.is_section && category.parent) {
    categories.unshift(category.parent);
  }

  return (
    <Breadcrumb size="sm" className="-ml-6">
      <BreadcrumbItem onSelected={() => navigate(`/hc`)}>
        <Trans message="Help center" />
      </BreadcrumbItem>
      {categories.map(category => (
        <BreadcrumbItem
          key={category.id}
          onSelected={() => navigate(getCategoryLink(category))}
        >
          <Trans message={category.name} />
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
