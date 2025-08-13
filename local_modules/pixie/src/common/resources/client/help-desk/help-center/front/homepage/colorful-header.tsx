import React, {useState} from 'react';
import {useSearchArticles} from '@common/help-desk/help-center/front/search/use-search-articles';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {ComboBox} from '@ui/forms/combobox/combobox';
import {SearchIcon} from '@ui/icons/material/Search';
import {Item} from '@ui/forms/listbox/item';
import {getArticleLink} from '@common/help-desk/help-center/front/articles/article-link';
import {ArticlePath} from '@common/help-desk/help-center/front/articles/article-path';
import {useSettings} from '@ui/settings/use-settings';
import {useTrans} from '@ui/i18n/use-trans';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {LandingPagePattern} from '@common/help-desk/help-center/front/homepage/landing-page-pattern';
import {Trans} from '@ui/i18n/trans';
import {message} from '@ui/i18n/message';
import {useLandingPageHeaderBackground} from '@common/help-desk/help-center/front/homepage/use-landing-page-header-background';
import {useLightThemeVariables} from '@ui/themes/use-light-theme-variables';

export function ColorfulHeader() {
  const {landing} = useSettings();
  const config = landing?.header;
  const {trans} = useTrans();
  const cssProps = useLandingPageHeaderBackground();

  return (
    <div
      className="relative mb-30 overflow-hidden bg-primary-dark pt-20 text-white dark:bg-transparent md:mb-60"
      style={cssProps}
    >
      <Navbar
        color="transparent"
        darkModeColor="transparent"
        className="container relative z-10 mx-auto"
        menuPosition="header"
        primaryButtonColor="white"
      />
      {!config?.background && <LandingPagePattern />}
      <div className="relative mx-auto px-24 pb-34 pt-40 md:px-50 md:pb-64 md:pt-70 lg:max-w-850">
        {config?.title && (
          <h1 className="text-center text-3xl md:text-5xl">
            <Trans message={config?.title} />
          </h1>
        )}
        {config?.subtitle && (
          <p className="mt-12 text-center text-base md:text-xl">
            <Trans message={config?.subtitle} />
          </p>
        )}
        <SearchField
          placeholder={
            config?.placeholder ? trans(message(config.placeholder)) : undefined
          }
        />
      </div>
    </div>
  );
}

interface SearchFieldProps {
  placeholder?: string;
}
function SearchField({placeholder}: SearchFieldProps) {
  const [query, setQuery] = useState('');
  const {data, isLoading} = useSearchArticles(query);
  const navigate = useNavigate();
  const lightThemeVars = useLightThemeVariables();

  return (
    <div style={lightThemeVars}>
      <ComboBox
        inputValue={query}
        onInputValueChange={setQuery}
        isAsync
        isLoading={isLoading}
        items={data?.pagination.data}
        clearInputOnItemSelection
        hideEndAdornment
        placeholder={placeholder}
        startAdornment={<SearchIcon className="ml-8" />}
        className="relative mt-34"
        inputClassName="bg-white min-h-60"
        inputRing="ring-0"
        inputRadius="rounded-xl"
        size="lg"
        selectionMode="none"
      >
        {result => (
          <Item
            padding="py-8 px-12"
            radius="rounded"
            key={result.id}
            value={result.id}
            onSelected={() => {
              close();
              navigate(getArticleLink(result));
            }}
            description={<ArticlePath article={result} />}
            textLabel={result.title}
          >
            {result.title}
          </Item>
        )}
      </ComboBox>
    </div>
  );
}
