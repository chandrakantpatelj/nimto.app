import {useValueLists} from '../http/value-lists';
import {Button} from '@ui/buttons/button';
import {LanguageIcon} from '@ui/icons/material/Language';
import {KeyboardArrowDownIcon} from '@ui/icons/material/KeyboardArrowDown';
import {Menu, MenuItem, MenuTrigger} from '@ui/menu/menu-trigger';
import {useSelectedLocale} from '@ui/i18n/selected-locale';
import {useChangeLocale} from '@common/locale-switcher/change-locale';
import {useSettings} from '@ui/settings/use-settings';

export function LocaleSwitcher() {
  const {locale} = useSelectedLocale();
  const changeLocale = useChangeLocale();
  const {data} = useValueLists(['localizations']);
  const {i18n} = useSettings();

  if (!data?.localizations || !locale || !i18n.enable) return null;

  return (
    <MenuTrigger
      floatingWidth="matchTrigger"
      selectionMode="single"
      selectedValue={locale.language}
      onSelectionChange={value => {
        const newLocale = value as string;
        if (newLocale !== locale?.language) {
          changeLocale.mutate({locale: newLocale});
        }
      }}
    >
      <Button
        disabled={changeLocale.isPending}
        className="capitalize"
        startIcon={<LanguageIcon />}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {locale.name}
      </Button>
      <Menu>
        {data.localizations.map(localization => (
          <MenuItem
            value={localization.language}
            key={localization.language}
            className="capitalize"
          >
            {localization.name}
          </MenuItem>
        ))}
      </Menu>
    </MenuTrigger>
  );
}
