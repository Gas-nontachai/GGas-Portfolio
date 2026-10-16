import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AssetProgress } from '../utils/preloadAssets'
import './loading.css'

type Props = {
  phase: 'bootstrap' | 'assets' | 'finishing'
  progress?: AssetProgress
  icons?: string[]
  failed?: boolean
  slow?: boolean
  onRetry?: () => void
}

const colors = ['#ffe16b', '#ff80ab', '#6699f5', '#b9e8fa', '#ffffff', '#ffe16b']

export default function LoadingScreen({
  phase,
  progress,
  icons = [],
  failed = false,
  slow = false,
  onRetry,
}: Props) {
  const { t } = useTranslation()
  const screen = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [loadedIcons, setLoadedIcons] = useState<string[]>([])
  const [tip, setTip] = useState(0)
  const branded = phase !== 'bootstrap'
  const icon = icons[index % (icons.length || 1)]
  const iconReady = icon && loadedIcons.includes(icon)
  const completed = progress ? progress.completed - progress.failed : 0
  const total = progress?.total ?? 0
  const percent = total ? (completed / total) * 100 : 0
  const status = failed
    ? 'failed'
    : phase === 'bootstrap'
      ? 'preparing'
      : phase === 'finishing'
        ? 'finishing'
        : 'packing'

  useEffect(() => {
    if (branded) screen.current?.focus({ preventScroll: true })
  }, [branded])

  useEffect(() => {
    if (!branded || failed) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let iconTimer: ReturnType<typeof window.setInterval> | undefined
    let tipTimer: ReturnType<typeof window.setInterval> | undefined
    const update = () => {
      window.clearInterval(iconTimer)
      window.clearInterval(tipTimer)
      if (!media.matches) {
        iconTimer = window.setInterval(() => setIndex((value) => value + 1), 1400)
        tipTimer = window.setInterval(() => setTip((value) => (value + 1) % 3), 4500)
      }
    }
    update()
    media.addEventListener('change', update)
    return () => {
      window.clearInterval(iconTimer)
      window.clearInterval(tipTimer)
      media.removeEventListener('change', update)
    }
  }, [branded, failed])

  return (
    <div
      ref={screen}
      className="loading-screen"
      data-phase={phase}
      role={branded ? 'dialog' : 'status'}
      aria-modal={branded ? true : undefined}
      aria-labelledby="startup-title"
      tabIndex={branded ? -1 : undefined}
    >
      <div className="loading-panel">
        <div
          className="loading-mark"
          aria-hidden="true"
          style={{ backgroundColor: branded ? colors[index % colors.length] : undefined }}
        >
          {!iconReady && (
            <svg
              viewBox="0 0 32 32"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            >
              <path d="m16 3 3.5 9.5L29 16l-9.5 3.5L16 29l-3.5-9.5L3 16l9.5-3.5Z" />
            </svg>
          )}
          {branded && icon && (
            <img
              key={icon}
              src={icon}
              alt=""
              draggable={false}
              style={{ opacity: iconReady ? 1 : 0 }}
              onLoad={() =>
                setLoadedIcons((previous) =>
                  previous.includes(icon) ? previous : [...previous, icon],
                )
              }
            />
          )}
        </div>
        <h1 id="startup-title">THANGGAS WORLD JOURNEY</h1>
        <p className="loading-status" aria-live={branded ? 'polite' : undefined}>
          {t(`loading.${failed ? 'error' : status}`)}
        </p>
        <div
          className="loading-track"
          role="progressbar"
          aria-label={t(branded ? 'loading.images' : 'loading.preparing')}
          aria-valuemin={0}
          aria-valuemax={total || 100}
          aria-valuenow={branded && total ? completed : undefined}
          data-indeterminate={!branded || !total}
        >
          <span style={branded && total ? { width: `${percent}%` } : undefined} />
        </div>
        <p className="loading-count">
          {branded && total > 0
            ? t('loading.files', { completed, total })
            : t('loading.preparingDetail')}
        </p>
        <div className="loading-detail">
          {failed ? (
            <p role="alert">{t('loading.failed')}</p>
          ) : slow ? (
            <p role="status">{t('loading.slow')}</p>
          ) : branded ? (
            <p key={tip} className="loading-tip">
              {t(`loading.tips.${tip}`)}
            </p>
          ) : null}
        </div>
        {failed && onRetry && (
          <button type="button" onClick={onRetry}>
            {t('loading.retry')}
          </button>
        )}
      </div>
    </div>
  )
}
