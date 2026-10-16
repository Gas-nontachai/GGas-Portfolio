import { useEffect, useState, type ReactNode } from 'react'
import { preloadBootstrapAssets } from '../utils/preloadBootstrapAssets'
import { preparePortfolio } from '../utils/loadingPipeline'
import type { AssetProgress } from '../utils/preloadAssets'
import CustomCursor from './CustomCursor'
import LoadingScreen from './LoadingScreen'

type Props = {
  children: (ready: boolean) => ReactNode
  prepareContent: () => Promise<void>
}

export default function AssetGate({ children, prepareContent }: Props) {
  const [attempt, setAttempt] = useState(0)
  const [ready, setReady] = useState(false)
  const [bootstrapReady, setBootstrapReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [slow, setSlow] = useState(false)
  const [icons, setIcons] = useState<string[]>([])
  const [progress, setProgress] = useState<AssetProgress>({ completed: 0, total: 0, failed: 0 })

  useEffect(() => {
    if (ready) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => setSlow(true), 8000)
    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(timer)
    }
  }, [ready, attempt])

  useEffect(() => {
    let active = true
    void preloadBootstrapAssets()
      .then(() => {
        if (active) setBootstrapReady(true)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [attempt])

  useEffect(() => {
    if (!bootstrapReady) return
    let active = true
    void preparePortfolio(prepareContent, async () => {
      const assets = await import('../utils/preloadAssets')
      if (active) setIcons(assets.overlayImageUrls)
      return assets.preloadAssets((next) => {
        if (active) setProgress(next)
      })
    })
      .then(() => {
        if (active) setReady(true)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [bootstrapReady, attempt, prepareContent])

  const retry = () => {
    setFailed(false)
    setSlow(false)
    setProgress({ completed: 0, total: 0, failed: 0 })
    setAttempt((previous) => previous + 1)
  }
  const phase = !bootstrapReady
    ? 'bootstrap'
    : progress.total > 0 && progress.completed === progress.total
      ? 'finishing'
      : 'assets'

  return (
    <>
      {bootstrapReady && <CustomCursor />}
      <div className="contents" inert={!ready} aria-hidden={!ready} aria-busy={!ready}>
        {bootstrapReady && children(ready)}
      </div>
      {!ready && (
        <LoadingScreen
          phase={phase}
          progress={progress}
          icons={icons}
          failed={failed}
          slow={slow}
          onRetry={retry}
        />
      )}
    </>
  )
}
