import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import enHome from '@/locales/en/home.json'
import esCommon from '@/locales/es/common.json'
import esHome from '@/locales/es/home.json'
import frCommon from '@/locales/fr/common.json'
import frHome from '@/locales/fr/home.json'
import ptCommon from '@/locales/pt/common.json'
import ptHome from '@/locales/pt/home.json'
import deCommon from '@/locales/de/common.json'
import deHome from '@/locales/de/home.json'
import arCommon from '@/locales/ar/common.json'
import arHome from '@/locales/ar/home.json'
import hiCommon from '@/locales/hi/common.json'
import hiHome from '@/locales/hi/home.json'
import zhCommon from '@/locales/zh/common.json'
import zhHome from '@/locales/zh/home.json'

export interface SupportedLanguage {
  code: string
  label: string
  nativeLabel: string
  dir: 'ltr' | 'rtl'
}

export const supportedLanguages: SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', dir: 'ltr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', dir: 'ltr' },
]

/** Maps a two-letter country code to a default supported language. */
export const countryToLanguage: Record<string, string> = {
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en', NG: 'en', KE: 'en',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', UY: 'es', PY: 'es', BO: 'es', DO: 'es', CR: 'es', PA: 'es', HN: 'es', SV: 'es', NI: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', CM: 'fr', CD: 'fr',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  DE: 'de', AT: 'de', LI: 'de',
  SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', JO: 'ar', LB: 'ar', IQ: 'ar', MA: 'ar', TN: 'ar', DZ: 'ar', LY: 'ar',
  IN: 'hi',
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, home: enHome },
      es: { common: esCommon, home: esHome },
      fr: { common: frCommon, home: frHome },
      pt: { common: ptCommon, home: ptHome },
      de: { common: deCommon, home: deHome },
      ar: { common: arCommon, home: arHome },
      hi: { common: hiCommon, home: hiHome },
      zh: { common: zhCommon, home: zhHome },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages.map((l) => l.code),
    ns: ['common', 'home'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hopeland_lang',
    },
  })

export function setDocumentDirection(langCode: string) {
  const lang = supportedLanguages.find((l) => l.code === langCode)
  document.documentElement.lang = langCode
  document.documentElement.dir = lang?.dir ?? 'ltr'
}

export default i18next
