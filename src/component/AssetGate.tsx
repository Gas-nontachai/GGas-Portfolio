import { useEffect, useRef, useState, type ReactNode } from 'react'
import { RotateCcw, Sparkles, Square, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  overlayImageUrls,
  preloadAssets,
  preloadOverlayAssets,
  type AssetProgress,
} from '../utils/preloadAssets'

const iconColors = ['#ffe16b', '#ff80ab', '#6699f5', '#b9e8fa', '#ffffff', '#ffe16b']

export default function AssetGate({ children }: { children: (ready: boolean) => ReactNode }) {
  const { t } = useTranslation()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [ready, setReady] = useState(false)
  const [overlayReady, setOverlayReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [iconIndex, setIconIndex] = useState(0)
  const [progress, setProgress] = useState<AssetProgress>({ completed: 0, total: 1, failed: 0 })

  useEffect(() => {
    if (ready) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [ready])

  useEffect(() => {
    let active = true
    void preloadOverlayAssets()
      .then(() => {
        if (active) setOverlayReady(true)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
    }
  }, [attempt])

  useEffect(() => {
    if (!overlayReady) return
    let active = true
    overlayRef.current?.focus({ preventScroll: true })

    void preloadAssets((next) => {
      if (active) setProgress(next)
    })
      .then((result) => {
        if (!active) return
        if (result.failed) setFailed(true)
        else {
          setReady(true)
        }
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
    }
  }, [overlayReady, attempt])

  useEffect(() => {
    if (!overlayReady || ready || failed) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let interval: ReturnType<typeof window.setInterval> | undefined
    const updateRotation = () => {
      window.clearInterval(interval)
      if (!media.matches)
        interval = window.setInterval(() => setIconIndex((previous) => previous + 1), 850)
    }
    updateRotation()
    media.addEventListener('change', updateRotation)
    return () => {
      window.clearInterval(interval)
      media.removeEventListener('change', updateRotation)
    }
  }, [overlayReady, ready, failed])

  const percentage = progress.total ? Math.floor((progress.completed / progress.total) * 100) : 100
  const icon = overlayImageUrls[iconIndex % overlayImageUrls.length]

  if (!overlayReady)
    return (
      <div
        role="status"
        className="grid min-h-svh place-content-center bg-[#f3f3ee] p-6 text-center font-mono text-[#171717]"
      >
        <strong>THANGGAS WORLD JOURNEY</strong>
        <p>{failed ? t('loading.failed') : 'Loading...'}</p>
        {failed && (
          <button
            type="button"
            className="min-h-12 border-2 border-[#171717] bg-[#ffe16b] px-4 py-2"
            onClick={() => {
              setFailed(false)
              setAttempt((previous) => previous + 1)
            }}
          >
            {t('loading.retry')}
          </button>
        )}
      </div>
    )

  return (
    <>
      <div className="contents" inert={!ready} aria-hidden={!ready} aria-busy={!ready}>
        {children(ready)}
      </div>
      {!ready && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="asset-loading-title"
          tabIndex={-1}
          className="fixed inset-0 z-[10000] grid place-items-center overflow-y-auto bg-[#f8f8f5]/75 px-6 py-10 text-[#171717] outline-none backdrop-blur-[3px]"
        >
          <div className="w-full max-w-[480px] text-center">
            <div className="mb-7 flex items-center justify-center gap-5 max-[420px]:gap-3">
              <span
                className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-[6px] border-[4px] border-[#171717] shadow-[0_4px_0_#171717] max-[420px]:size-16"
                style={{ backgroundColor: iconColors[iconIndex % iconColors.length] }}
                aria-hidden="true"
              >
                <img
                  src={icon}
                  alt=""
                  className="size-full scale-[1.6] object-contain"
                  draggable={false}
                />
              </span>
              <h1
                id="asset-loading-title"
                className="m-0 min-w-0 text-[32px] leading-tight font-bold uppercase max-[420px]:text-[26px]"
              >
                {t(failed ? 'loading.error' : 'loading.title')}
              </h1>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
              aria-label={t('loading.title')}
              className="h-11 w-full rounded-[3px] border-[4px] border-[#171717] bg-white p-[5px]"
            >
              <div
                className="h-full rounded-[3px] bg-[#ffe16b] transition-[width] duration-200 motion-reduce:transition-none"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p
              role="status"
              className="mt-6 mb-0 text-[18px] leading-relaxed uppercase max-[420px]:text-[16px]"
            >
              {t(failed ? 'loading.failed' : 'loading.wait')}{' '}
              {!failed && <span className="whitespace-nowrap tabular-nums">{percentage}%</span>}
            </p>
            <div className="mt-8 flex h-8 items-center justify-center gap-5" aria-hidden="true">
              <Star className="size-6 animate-bounce motion-reduce:animate-none" />
              <Square className="size-4 animate-bounce text-[#6699f5] [animation-delay:150ms] motion-reduce:animate-none" />
              <Sparkles className="size-6 animate-bounce text-[#ff80ab] [animation-delay:300ms] motion-reduce:animate-none" />
            </div>
            {failed && (
              <button
                type="button"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-[#171717] bg-[#ffe16b] px-4 py-2 font-bold shadow-[3px_3px_0_#171717] focus-visible:outline-2 focus-visible:outline-offset-4"
                onClick={() => {
                  setFailed(false)
                  setProgress({ completed: 0, total: progress.total, failed: 0 })
                  setAttempt((previous) => previous + 1)
                }}
              >
                <RotateCcw size={18} aria-hidden="true" />
                {t('loading.retry')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
