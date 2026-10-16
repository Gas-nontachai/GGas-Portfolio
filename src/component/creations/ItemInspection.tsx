import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import ScrambleText from '../ScrambleText'
import CreationArtwork from './CreationArtwork'
import type { Creation } from './types'
import type { InventoryView } from './inventoryState'
import { canOpenNotebook } from './inventoryState'

export type InspectionOrigin = {
  button: HTMLButtonElement
  art: HTMLElement
  initialState: ReturnType<typeof Flip.getState>
}
type Props = {
  item: Creation
  origin: InspectionOrigin
  view: InventoryView
  onOpened: () => void
  onClose: () => void
  onMore: () => void
  onExited: () => void
}

export default function ItemInspection({
  item,
  origin,
  view,
  onOpened,
  onClose,
  onMore,
  onExited,
}: Props) {
  const { t } = useTranslation()
  const overlay = useRef<HTMLDivElement>(null)
  const expanded = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const active = useRef<gsap.core.Timeline | null>(null)
  const closeAnimation = useRef<() => void>(() => {})
  const originArt = useRef(origin.art)
  const callbacks = useRef({ onOpened, onClose, onExited })
  useLayoutEffect(() => {
    callbacks.current = { onOpened, onClose, onExited }
  })

  useLayoutEffect(() => {
    const root = document.getElementById('root')!
    const html = document.documentElement
    const art = originArt.current
    const previous = {
      inert: root.inert,
      overflow: html.style.overflow,
      behavior: html.style.scrollBehavior,
      visibility: art.style.visibility,
    }
    const scroll = { x: window.scrollX, y: window.scrollY }
    const element = expanded.current!
    const textbox = panel.current!
    const backdrop = overlay.current!.querySelector('.creation-inspection-backdrop')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let closing = false
    let disposed = false
    root.inert = true
    html.style.overflow = 'hidden'
    art.style.visibility = 'hidden'
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          if (!disposed && !closing) callbacks.current.onOpened()
        },
      })
      active.current = timeline
      if (reduced.matches) {
        gsap.set([backdrop, textbox, element], { opacity: 1, y: 0 })
        callbacks.current.onOpened()
      } else {
        const flip = Flip.from(origin.initialState, {
          targets: element,
          scale: true,
          duration: 0.5,
          ease: 'power3.out',
          paused: true,
        })
        timeline
          .add(flip.play(), 0)
          .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0)
          .fromTo(
            textbox,
            { y: 70, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
            0.16,
          )
          .fromTo(
            textbox.querySelectorAll('[data-preview-content]'),
            { y: 9, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.28, stagger: 0.05 },
            0.26,
          )
      }
    }, overlay)
    closeButton.current!.focus({ preventScroll: true })
    closeAnimation.current = () => {
      if (closing || disposed) return
      closing = true
      active.current?.kill()
      const finish = () => {
        if (!disposed) {
          art.style.visibility = previous.visibility
          callbacks.current.onExited()
        }
      }
      if (reduced.matches) {
        finish()
        return
      }
      // Source and target are square artwork boxes, so FLIP always uses a uniform scale.
      const destination = Flip.getState(art)
      const timeline = gsap.timeline({ onComplete: finish })
      active.current = timeline
      timeline
        .to(textbox, { y: 45, opacity: 0, duration: 0.18 }, 0)
        .add(
          Flip.to(destination, {
            targets: element,
            scale: true,
            duration: 0.4,
            ease: 'power3.inOut',
            paused: true,
          }).play(),
          0.06,
        )
        .to(backdrop, { opacity: 0, duration: 0.2 }, 0.24)
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        callbacks.current.onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [
        ...overlay.current!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'),
      ]
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first || !overlay.current!.contains(document.activeElement))
      ) {
        event.preventDefault()
        last?.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !overlay.current!.contains(document.activeElement))
      ) {
        event.preventDefault()
        first?.focus()
      }
    }
    const resize = () => {
      scroll.x = window.scrollX
      scroll.y = window.scrollY
      active.current?.progress(1)
    }
    const motionChanged = () => {
      if (reduced.matches) active.current?.progress(1)
    }
    document.addEventListener('keydown', keydown, true)
    window.addEventListener('resize', resize)
    reduced.addEventListener('change', motionChanged)
    return () => {
      disposed = true
      active.current?.kill()
      context.revert()
      art.style.visibility = previous.visibility
      root.inert = previous.inert
      html.style.overflow = previous.overflow
      html.style.scrollBehavior = 'auto'
      window.scrollTo(scroll.x, scroll.y)
      html.style.scrollBehavior = previous.behavior
      if (origin.button.isConnected) origin.button.focus({ preventScroll: true })
      document.removeEventListener('keydown', keydown, true)
      window.removeEventListener('resize', resize)
      reduced.removeEventListener('change', motionChanged)
    }
  }, [item, origin])

  useLayoutEffect(() => {
    if (view === 'preview-closing') closeAnimation.current()
  }, [view])

  return createPortal(
    <div
      ref={overlay}
      className="creation-inspection"
      role="dialog"
      aria-modal="true"
      aria-labelledby="creation-preview-title"
      aria-describedby="creation-preview-summary"
      style={{ '--creation-color': item.color } as CSSProperties}
    >
      <div className="creation-inspection-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="creation-inspection-content">
        <div
          ref={expanded}
          className="creation-expanded-art"
          data-flip-id={`creation-art-${item.id}`}
          aria-hidden="true"
        >
          <CreationArtwork artwork={item.artwork} />
        </div>
        <div ref={panel} className="creation-preview-panel">
          <button
            ref={closeButton}
            type="button"
            className="creation-preview-close"
            onClick={onClose}
            aria-label={t('creations.close')}
          >
            <X aria-hidden="true" />
          </button>
          <p className="creation-preview-meta" data-preview-content>
            <ScrambleText
              text={[t(item.categoryKey), t(`creations.status.${item.status}`)].join(' / ')}
            />
          </p>
          <h3 id="creation-preview-title" data-preview-content>
            <ScrambleText
              text={t(item.titleKey, { number: item.id.replace('mystery-', '').padStart(2, '0') })}
            />
          </h3>
          <p id="creation-preview-summary" data-preview-content>
            <ScrambleText text={t(item.summaryKey)} />
          </p>
          {canOpenNotebook(item) && (
            <button
              className="creation-more"
              disabled={view !== 'preview-open'}
              onClick={onMore}
              data-preview-content
            >
              <ScrambleText text={t('creations.more')} />
              <ArrowUpRight size={19} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
