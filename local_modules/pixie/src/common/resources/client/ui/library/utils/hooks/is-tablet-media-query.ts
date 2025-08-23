import {
  useMediaQuery,
  UseMediaQueryOptions,
} from '@ui/utils/hooks/use-media-query';

export function useIsTabletMediaQuery(options?: UseMediaQueryOptions) {
  return useMediaQuery('(max-width: 1024px)', options);
}
