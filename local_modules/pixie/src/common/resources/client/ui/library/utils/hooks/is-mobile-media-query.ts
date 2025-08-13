import {
  useMediaQuery,
  UseMediaQueryOptions,
} from '@ui/utils/hooks/use-media-query';

export function useIsMobileMediaQuery(options?: UseMediaQueryOptions) {
  return useMediaQuery('(max-width: 768px)', options);
}
