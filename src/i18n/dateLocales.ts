import { enUS, fr, ar, es, de, ko, ja, pt, tr, zhTW, hi, id, vi, it, nl, type Locale } from 'date-fns/locale';
import i18n from './config';

const localeMap: Record<string, Locale> = { en: enUS, fr, ar, es, de, ko, ja, pt, tr, 'zh-TW': zhTW, hi, id, vi, it, nl };

export function getDateFnsLocale(): Locale {
  return localeMap[i18n.language] || enUS;
}
