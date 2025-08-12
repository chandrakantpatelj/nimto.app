import {CssTheme} from '@ui/themes/css-theme';
import {Settings} from '@ui/settings/settings';
import {User} from '@ui/types/user';
import {Localization} from '@ui/i18n/localization';

export interface BootstrapData {
  themes: {all: CssTheme[]; selectedThemeId?: number | string | null};
  sentry_release?: string;
  is_mobile_device?: boolean;
  settings: Settings;
  user: User | null;
  i18n: Localization;
}
