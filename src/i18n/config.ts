import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import de from './locales/de.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar }, es: { translation: es }, de: { translation: de }, ko: { translation: ko }, ja: { translation: ja } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar', 'es', 'de', 'ko', 'ja'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'i18nextLng' },
  });

export default i18n;
