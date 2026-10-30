import en from './locales/en.json';
import th from './locales/th.json';
import lo from './locales/lo.json';

export type Locale = 'en' | 'th' | 'lo';

const translations: Record<Locale, typeof en> = {
  en,
  th,
  lo,
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en;
}

export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
  lo: 'ລາວ',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  th: '🇹🇭',
  lo: '🇱🇦',
};
