import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { smoothstep } from '../notebookMotion'

type Props = { source: HTMLElement; onExited: () => void }

export default function PolaroidZoom({ source, onExited }: Props) {
  const { t } = useTranslation()
  const overlayRef = useRef<HTMLDivElement>(null)
  const flightRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const closeAnimation = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    const overlay = overlayRef.current!
    const flight = flightRef.current!
    const closeButton = closeRef.current!
    const backdrop = overlay.querySelector<HTMLElement>('.polaroid-zoom-backdrop')!
    const notebook = source.closest<HTMLElement>('.notebook-overlay')
    const app = document.getElementById('root')
    const background = notebook ?? app
    const originalInert = background?.inert ?? false
    const originalVisibility = source.style.visibility
    const html = document.documentElement
    const originalOverflow = html.style.overflow
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let closing = false
    let opening = true
    let disposed = false
    let timeline: gsap.core.Timeline | null = null

    const clone = source.cloneNode(true) as HTMLElement
    const originals = [source, ...source.querySelectorAll<HTMLElement>('*')]
    const copies = [clone, ...clone.querySelectorAll<HTMLElement>('*')]
    const copyAppearance = () => {
      // Resize can recopy the frame after its source has been hidden for flight.
      // Read its original visibility so the cloned photo stays visible too.
      const visibility = source.style.visibility
      gsap.set(source, { visibility: originalVisibility })
      try {
        originals.forEach((element, index) => {
          const computed = getComputedStyle(element)
          for (const property of computed)
            copies[index].style.setProperty(property, computed.getPropertyValue(property))
          copies[index].removeAttribute('id')
          copies[index].removeAttribute('tabindex')
        })
      } finally {
        gsap.set(source, { visibility })
      }
      Object.assign(clone.style, {
        position: 'relative',
        margin: '0',
        transform: 'none',
        transition: 'none',
        visibility: 'visible',
        opacity: '1',
        pointerEvents: 'none',
      })
    }
    copyAppearance()
    clone.removeAttribute('role')
    clone.removeAttribute('aria-haspopup')
    clone.removeAttribute('aria-expanded')
    clone.setAttribute('aria-hidden', 'true')
    flight.append(clone)

    const dimensions = () => {
      const computed = getComputedStyle(source)
      const extra = (properties: string[]) =>
        properties.reduce(
          (total, property) => total + (parseFloat(computed.getPropertyValue(property)) || 0),
          0,
        )
      const width =
        parseFloat(computed.width) +
        (computed.boxSizing === 'border-box'
          ? 0
          : extra(['padding-left', 'padding-right', 'border-left-width', 'border-right-width']))
      const height =
        parseFloat(computed.height) +
        (computed.boxSizing === 'border-box'
          ? 0
          : extra(['padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width']))
      return { width, height }
    }
    let initialSize = dimensions()
    const updateSize = () => {
      initialSize = dimensions()
      copyAppearance()
      gsap.set(flight, { width: initialSize.width, height: initialSize.height })
      Object.assign(clone.style, {
        width: `${initialSize.width}px`,
        height: `${initialSize.height}px`,
        boxSizing: 'border-box',
        maxWidth: 'none',
        minWidth: '0',
      })
    }
    updateSize()

    const sourcePose = () => {
      const rect = source.getBoundingClientRect()
      const bounds = overlay.getBoundingClientRect()
      const matrix = new DOMMatrixReadOnly(getComputedStyle(source).transform)
      const rotation = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
      const radians = (rotation * Math.PI) / 180
      const size = dimensions()
      const visualScale =
        rect.width /
        (Math.abs(Math.cos(radians)) * size.width + Math.abs(Math.sin(radians)) * size.height)
      return {
        x: rect.left + rect.width / 2 - bounds.left - initialSize.width / 2,
        y: rect.top + rect.height / 2 - bounds.top - initialSize.height / 2,
        scale: (size.width / initialSize.width) * visualScale,
        rotation,
      }
    }
    const centeredPose = () => {
      const bounds = overlay.getBoundingClientRect()
      const margin = bounds.width < 600 ? 24 : 64
      const scale = Math.max(
        0.01,
        Math.min(
          (bounds.width - margin * 2) / (initialSize.width + 16),
          (bounds.height - 144) / (initialSize.height + 56),
        ),
      )
      return {
        x: (bounds.width - initialSize.width) / 2,
        y: (bounds.height - initialSize.height) / 2,
        scale,
        rotation: 0,
      }
    }

    gsap.set(flight, { ...sourcePose(), force3D: true, transformOrigin: '50% 50%' })
    gsap.set([backdrop, closeButton], { opacity: 0 })
    gsap.set(source, { visibility: 'hidden' })
    if (background) background.inert = true
    html.style.overflow = 'hidden'

    const finish = () => {
      if (disposed) return
      onExited()
    }
    const close = () => {
      if (closing || disposed) return
      closing = true
      opening = false
      timeline?.kill()
      if (reduced.matches) {
        finish()
        return
      }
      timeline = gsap
        .timeline({ onComplete: finish })
        .to(flight, { ...sourcePose(), duration: 0.65, ease: 'power3.inOut' }, 0)
        .to(backdrop, { opacity: 0, duration: 0.65, ease: smoothstep }, 0)
        .to(closeButton, { opacity: 0, duration: 0.15 }, 0)
    }
    closeAnimation.current = close
    if (reduced.matches) {
      opening = false
      gsap.set(flight, centeredPose())
      gsap.set([backdrop, closeButton], { opacity: 1 })
    } else {
      timeline = gsap
        .timeline({
          onComplete: () => {
            opening = false
          },
        })
        .to(flight, { ...centeredPose(), duration: 0.65, ease: 'power3.inOut' }, 0)
        .to(backdrop, { opacity: 1, duration: 0.65, ease: smoothstep }, 0)
        .to(closeButton, { opacity: 1, duration: 0.2 }, 0.4)
    }
    closeButton.focus({ preventScroll: true })

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        close()
      } else if (event.key === 'Tab') {
        event.preventDefault()
        event.stopImmediatePropagation()
        closeButton.focus({ preventScroll: true })
      }
    }
    const resize = () => {
      if (closing) {
        timeline?.kill()
        if (reduced.matches) finish()
        else
          timeline = gsap
            .timeline({ onComplete: finish })
            .to(flight, { ...sourcePose(), duration: 0.25, ease: 'power3.inOut' }, 0)
            .to([backdrop, closeButton], { opacity: 0, duration: 0.25, ease: smoothstep }, 0)
        return
      }
      timeline?.kill()
      updateSize()
      if (opening && !reduced.matches) {
        // Locking page scroll can resize the viewport as the photo opens.
        // Continue the flight from its current pose instead of snapping to center.
        timeline = gsap
          .timeline({
            onComplete: () => {
              opening = false
            },
          })
          .to(flight, { ...centeredPose(), duration: 0.65, ease: 'power3.inOut' }, 0)
          .to([backdrop, closeButton], { opacity: 1, duration: 0.4 }, 0)
      } else {
        opening = false
        gsap.set(flight, centeredPose())
        gsap.set([backdrop, closeButton], { opacity: 1 })
      }
    }
    const motionChanged = () => {
      if (reduced.matches) resize()
    }
    document.addEventListener('keydown', keydown, true)
    window.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('resize', resize)
    reduced.addEventListener('change', motionChanged)
    const observer = new ResizeObserver(() => {
      const size = dimensions()
      if (size.width !== initialSize.width || size.height !== initialSize.height) resize()
    })
    observer.observe(source)

    return () => {
      disposed = true
      closeAnimation.current = () => {}
      timeline?.kill()
      document.removeEventListener('keydown', keydown, true)
      window.removeEventListener('resize', resize)
      window.visualViewport?.removeEventListener('resize', resize)
      reduced.removeEventListener('change', motionChanged)
      observer.disconnect()
      clone.remove()
      gsap.set(source, { visibility: originalVisibility })
      if (background) background.inert = originalInert
      html.style.overflow = originalOverflow
      if (source.isConnected) source.focus({ preventScroll: true })
    }
  }, [source, onExited])

  return createPortal(
    <div
      ref={overlayRef}
      className="polaroid-zoom-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={source.querySelector<HTMLImageElement>('img:not(.notebook-tape)')?.alt}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div
        className="polaroid-zoom-backdrop"
        aria-hidden="true"
        onClick={() => closeAnimation.current()}
      />
      <div ref={flightRef} className="polaroid-zoom-flight" />
      <button
        ref={closeRef}
        className="polaroid-zoom-close"
        type="button"
        aria-label={t('journey.notebook.closePhoto')}
        title={t('journey.notebook.closePhoto')}
        onClick={() => closeAnimation.current()}
      >
        <X size={24} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>,
    document.body,
  )
}
