import {useParams} from 'react-router-dom';

export function useHcArticleManagerParams() {
  const {sectionId} = useParams();
  return {sectionId, order: 'position|desc'};
}
