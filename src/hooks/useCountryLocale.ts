import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { countryToLanguage, setDocumentDirection } from '@/lib/i18n'

const STORAGE_KEY = 'hopeland_lang'
const GEO_ATTEMPTED_KEY = 'hopeland_geo_attempted'

/**
 * On first visit (no stored language preference yet), attempts to resolve the
 * visitor's country via a lightweight IP geolocation lookup and maps it to one
 * of the curated supported languages. Falls back silently to the
 * browser-language detection already configured in `i18next-browser-languagedetector`.
 * Runs only once per browser (guarded via localStorage) so it never overrides
 * an explicit choice made through the LanguageSwitcher.
 */
export function useCountryLocale() {
  const { i18n } = useTranslation()

  useEffect(() => {
    setDocumentDirection(i18n.language)
  }, [i18n.language])

  useEffect(() => {
    const hasStoredPreference = Boolean(localStorage.getItem(STORAGE_KEY))
    const alreadyAttempted = Boolean(localStorage.getItem(GEO_ATTEMPTED_KEY))
    if (hasStoredPreference || alreadyAttempted) return

    localStorage.setItem(GEO_ATTEMPTED_KEY, '1')

    const geoUrl = import.meta.env.VITE_GEO_LOOKUP_URL
    if (!geoUrl) return

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)

    fetch(geoUrl, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { country_code?: string; country?: string } | null) => {
        const countryCode = data?.country_code || data?.country
        if (!countryCode) return
        const language = countryToLanguage[countryCode.toUpperCase()]
        if (language) {
          void i18n.changeLanguage(language)
        }
      })
      .catch(() => {
        /* silently keep the browser-language fallback */
      })
      .finally(() => clearTimeout(timeout))

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
