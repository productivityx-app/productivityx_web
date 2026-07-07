import { enUS, fr, ar, es, de, ko, ja, type Locale } from 'date-fns/locale';
import i18n from './config';

const localeMap: Record<string, Locale> = { en: enUS, fr, ar, es, de, ko, ja };

export function getDateFnsLocale(): Locale {
  return localeMap[i18n.language] || enUS;
}
