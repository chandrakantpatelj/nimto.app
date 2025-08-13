import {useBootstrapDataStore} from '@ui/bootstrap-data/bootstrap-data-store';

export function useSelectedLocale() {
  const {i18n} = useBootstrapDataStore(s => s.data);
  return {
    locale: i18n,
    localeCode: i18n?.language || 'en',
    lines: i18n?.lines,
  };
}
