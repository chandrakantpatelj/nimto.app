'use client';

import { useEffect, useState } from 'react';
import { I18N_LANGUAGES } from '@/i18n/config';
import arTranslations from '@/i18n/messages/ar.json';
import chTranslations from '@/i18n/messages/ch.json';
import deTranslations from '@/i18n/messages/de.json';
// Import translation files
import enTranslations from '@/i18n/messages/en.json';
import esTranslations from '@/i18n/messages/es.json';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18nextProvider, initReactI18next } from 'react-i18next';

function I18nProvider({ children }) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n only on client side
    if (!i18n.isInitialized) {
      const resources = {
        en: { translation: enTranslations },
        ar: { translation: arTranslations },
        es: { translation: esTranslations },
        de: { translation: deTranslations },
        ch: { translation: chTranslations },
      };

      i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: 'en',
          debug: process.env.NODE_ENV === 'development',

          interpolation: {
            escapeValue: false, // React already does escaping
          },

          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'language',
          },

          react: {
            useSuspense: false, // Important for Next.js SSR
          },
        })
        .then(() => {
          setIsI18nInitialized(true);
        });
    } else {
      setIsI18nInitialized(true);
    }

    // Update document direction when language changes
    const handleLanguageChange = (lng) => {
      const language = I18N_LANGUAGES.find((lang) => lang.code === lng);
      if (language?.direction) {
        document.documentElement.setAttribute('dir', language.direction);
      }
    };

    // Set initial direction
    if (i18n.language) {
      handleLanguageChange(i18n.language);
    }

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Get current language for direction
  const currentLanguage =
    I18N_LANGUAGES.find((lang) => lang.code === (i18n.language || 'en')) ||
    I18N_LANGUAGES[0];

  // Don't render until i18n is initialized
  if (!isI18nInitialized) {
    return (
      <RadixDirectionProvider dir="ltr">{children}</RadixDirectionProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <RadixDirectionProvider dir={currentLanguage.direction}>
        {children}
      </RadixDirectionProvider>
    </I18nextProvider>
  );
}

const useLanguage = () => {
  const currentLanguage =
    I18N_LANGUAGES.find((lang) => lang.code === i18n.language) ||
    I18N_LANGUAGES[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
  };

  return {
    languageCode: i18n.language,
    language: currentLanguage,
    changeLanguage,
  };
};

export { I18nProvider, useLanguage };
