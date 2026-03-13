import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // اللغات المدعومة
  locales: ['ar', 'en'],
  
  // اللغة الافتراضية
  defaultLocale: 'ar',
  
  // دايماً نظهر اللغة في الرابط (/ar/about, /en/about)
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];