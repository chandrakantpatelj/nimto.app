import {useForm} from 'react-hook-form';
import {useId} from 'react';
import {Form} from '@ui/forms/form';
import {AccountSettingsPanel} from '@common/auth/ui/account-settings/account-settings-panel';
import {useUpdateAccountDetails} from '@common/auth/ui/account-settings/basic-info-panel/update-account-details';
import {Button} from '@ui/buttons/button';
import {useValueLists} from '@common/http/value-lists';
import {FormSelect} from '@ui/forms/select/select';
import {useChangeLocale} from '@common/locale-switcher/change-locale';
import {getLocalTimeZone} from '@internationalized/date';
import {AccountSettingsId} from '@common/auth/ui/account-settings/account-settings-sidenav';
import {TimezoneSelect} from '@common/auth/ui/account-settings/timezone-select';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {message} from '@ui/i18n/message';
import {User} from '@ui/types/user';
import {Item} from '@ui/forms/listbox/item';

interface Props {
  user: User;
}
export function LocalizationPanel({user}: Props) {
  const formId = useId();
  const {trans} = useTrans();
  const form = useForm<Partial<User>>({
    defaultValues: {
      language: user.language || '',
      country: user.country || '',
      timezone: user.timezone || getLocalTimeZone(),
    },
  });
  const updateDetails = useUpdateAccountDetails(form);
  const changeLocale = useChangeLocale();
  const {data} = useValueLists(['timezones', 'countries', 'localizations']);

  const countries = data?.countries || [];
  const localizations = data?.localizations || [];
  const timezones = data?.timezones || {};

  return (
    <AccountSettingsPanel
      id={AccountSettingsId.LocationAndLanguage}
      title={<Trans message="Date, time and language" />}
      actions={
        <Button
          type="submit"
          variant="flat"
          color="primary"
          form={formId}
          disabled={updateDetails.isPending || !form.formState.isValid}
        >
          <Trans message="Save" />
        </Button>
      }
    >
      <Form
        form={form}
        onSubmit={newDetails => {
          updateDetails.mutate(newDetails);
          changeLocale.mutate({locale: newDetails.language});
        }}
        id={formId}
      >
        <FormSelect
          className="mb-24"
          selectionMode="single"
          name="language"
          label={<Trans message="Language" />}
        >
          {localizations.map(localization => (
            <Item key={localization.language} value={localization.language}>
              {localization.name}
            </Item>
          ))}
        </FormSelect>
        <FormSelect
          className="mb-24"
          selectionMode="single"
          name="country"
          label={<Trans message="Country" />}
          showSearchField
          searchPlaceholder={trans(message('Search countries'))}
        >
          {countries.map(country => (
            <Item key={country.code} value={country.code}>
              {country.name}
            </Item>
          ))}
        </FormSelect>
        <TimezoneSelect
          label={<Trans message="Timezone" />}
          name="timezone"
          timezones={timezones}
        />
      </Form>
    </AccountSettingsPanel>
  );
}
