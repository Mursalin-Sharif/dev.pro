import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, Check } from 'lucide-react'
import { supportedLanguages } from '@/lib/i18n'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { i18n, t } = useTranslation()
  const { languageMenuOpen, toggleLanguageMenu, setLanguageMenuOpen } = useUiStore()

  return (
    <div className="relative">
      <button
        onClick={toggleLanguageMenu}
        aria-label={t('language.label')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
          tone === 'dark' ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-black/5',
        )}
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{i18n.language.toUpperCase()}</span>
      </button>
      <AnimatePresence>
        {languageMenuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setLanguageMenuOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-card"
            >
              {supportedLanguages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => {
                      void i18n.changeLanguage(lang.code)
                      localStorage.setItem('hopeland_lang', lang.code)
                      setLanguageMenuOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-ink hover:bg-black/5"
                  >
                    {lang.nativeLabel}
                    {i18n.language === lang.code && <Check size={14} className="text-primary" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
