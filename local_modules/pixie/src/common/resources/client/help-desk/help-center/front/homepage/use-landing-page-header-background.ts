import {useSettings} from '@ui/settings/use-settings';

export function useLandingPageHeaderBackground() {
  const {landing} = useSettings();
  if (!landing?.header?.background) return undefined;
  return {
    backgroundImage: `url(${landing?.header?.background})`,
    backgroundSize: landing?.header?.backgroundSize,
    backgroundRepeat: landing?.header?.backgroundRepeat,
    backgroundPosition: landing?.header?.backgroundPosition,
  };
}
