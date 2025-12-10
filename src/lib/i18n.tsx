
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider as ReactI18nextProvider } from 'react-i18next';
import pt from '@/locales/pt.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // default language
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    // debug: process.env.NODE_ENV === 'development',
  });

interface I18nContextType {
  changeLanguage: (lang: string) => void;
  language: string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
  }, []);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    
    // Set initial language from local storage or default
    const savedLanguage = localStorage.getItem('i18nextLng') || 'pt';
    if (i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage);
    }
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return (
    <I18nContext.Provider value={{ changeLanguage, language }}>
      <ReactI18nextProvider i18n={i18n}>
        {children}
      </ReactI18nextProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === null) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
