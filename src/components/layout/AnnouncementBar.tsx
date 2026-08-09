import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function AnnouncementBar() {
  const { t } = useTranslation()

  return (
    <div className="relative z-40 overflow-hidden bg-primary text-white">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-[11px] font-bold sm:text-sm">
        <span className="min-w-0 max-w-full text-balance sm:truncate">{t('announcement.text')}</span>
        <Link
          to="/register"
          className="inline-flex shrink-0 items-center gap-1 underline underline-offset-2 max-sm:text-[11px]"
        >
          {t('announcement.cta')}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
