import {useQuery} from '@tanstack/react-query';
import {Article} from '@common/help-desk/help-center/front/articles/article';
import {useParams} from 'react-router-dom';
import {apiClient} from '@common/http/query-client';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Section} from '@common/help-desk/help-center/front/categories/category';

export interface ArticlePageNavItem {
  indent: boolean;
  display_name: string;
  slug: string;
  type: string;
}

export interface GetArticleResponse extends BackendResponse {
  article: Article;
  pageNav?: ArticlePageNavItem[];
  categoryNav?: Section[];
}

export function useArticle(loader: 'articlePage' | 'updateArticle') {
  const {categoryId, sectionId, articleId} = useParams();
  return useQuery<GetArticleResponse>({
    queryKey: ['hc', 'articles', articleId, categoryId, sectionId, loader],
    queryFn: () => fetchArticle(articleId!, loader, categoryId, sectionId),
    initialData: () => {
      const data = getBootstrapData().loaders?.[loader];
      const [category, section] = data?.article?.path || [];
      if (
        data?.article?.id == articleId &&
        category?.id == categoryId &&
        section?.id == sectionId
      ) {
        return data;
      }
    },
  });
}

function fetchArticle(
  articleId: string | number,
  loader: string,
  categoryId?: string,
  sectionId?: string,
) {
  const url =
    categoryId && sectionId
      ? `hc/articles/${categoryId}/${sectionId}/${articleId}`
      : `hc/articles/${articleId}`;
  return apiClient
    .get<GetArticleResponse>(url, {params: {loader}})
    .then(response => response.data);
}
