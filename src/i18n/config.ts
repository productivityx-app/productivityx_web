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
import pt from './locales/pt.json';
import tr from './locales/tr.json';
import zhTW from './locales/zh-TW.json';
import hi from './locales/hi.json';
import id from './locales/id.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar }, es: { translation: es }, de: { translation: de }, ko: { translation: ko }, ja: { translation: ja }, pt: { translation: pt }, tr: { translation: tr }, 'zh-TW': { translation: zhTW }, hi: { translation: hi }, id: { translation: id } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar', 'es', 'de', 'ko', 'ja', 'pt', 'tr', 'zh-TW', 'hi', 'id'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'], lookupLocalStorage: 'i18nextLng' },
  });

export default i18n;
