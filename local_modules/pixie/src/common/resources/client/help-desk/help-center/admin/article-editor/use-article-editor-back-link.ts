import {useParams} from 'react-router-dom';

export function useArticleEditorBackLink() {
  const {categoryId, sectionId, articleId} = useParams();
  let backLink = categoryId || sectionId ? `../../` : `../`;
  if (articleId) {
    backLink += '../';
  }
  return backLink;
}
