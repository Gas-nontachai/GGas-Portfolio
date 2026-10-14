import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ScrambleText from '../ScrambleText'
import car from '../../assets/journey_timeline/journey_car_side.png'
import sign from '../../assets/journey_timeline/direction_sign.png'
import universityPhoto from '../../assets/journey_timeline/img/university-rmuti.png'
import starSticker from '../../assets/journey-notebook-asset-pack/svg/12-sticker-star.svg'
import heartSticker from '../../assets/journey-notebook-asset-pack/svg/13-sticker-heart.svg'
import arrowSticker from '../../assets/journey-notebook-asset-pack/svg/14-sticker-arrow.svg'
import blueTape from '../../assets/journey-notebook-asset-pack/svg/07-paper-tape-blue.svg'
import bookmark from '../../assets/journey-notebook-asset-pack/svg/09-bookmark-tab.svg'
import paperclip from '../../assets/journey-notebook-asset-pack/svg/18-paperclip.svg'
import closeIcon from '../../assets/journey-notebook-asset-pack/svg/10-close-button.svg'
import { lerp, notebookEase, smoothstep, smootherstep } from './notebookMotion'
import './notebook.css'

gsap.registerPlugin(Flip)

export type NotebookSelection = {
  id: string
  label: string
  color: string
  image: string | null
  source: HTMLButtonElement
  initialRect: DOMRect
  initialState: ReturnType<typeof Flip.getState>
}

type Props = { selection: NotebookSelection; onExited: () => void }

export default function JourneyNotebook({ selection, onExited }: Props) {
  const { t } = useTranslation()
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const closeAnimation = useRef<() => void>(() => {})
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(true)
  const turning = useRef(true)
  const pageTurn = useRef<gsap.core.Timeline | null>(null)
  const turnSheet = useRef<HTMLElement | null>(null)
  const restorePageFocus = useRef(false)
  const pageCount = selection.id === 'career' ? 2 : 1
  const chapterPrefix = `journey.stages.${selection.id}`
  const isUniversity = selection.id === 'university'
  const prefix = pageCount > 1 ? `${chapterPrefix}.spreads.${page === 0 ? 'first' : 'present'}` : chapterPrefix

  useLayoutEffect(() => {
    if (busy || !restorePageFocus.current) return
    restorePageFocus.current = false
    overlayRef.current?.querySelector<HTMLButtonElement>('.notebook-pagination button:not(:disabled)')?.focus({ preventScroll: true })
  }, [page, busy])

  const turnPage = (next: number) => {
    if (turning.current || next < 0 || next >= pageCount || next === page) return
    restorePageFocus.current = true
    const overlay = overlayRef.current!
    const scroll = overlay.querySelector<HTMLElement>('.notebook-paper-scroll')!
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPage(next)
      scroll.scrollTop = 0
      return
    }
    turning.current = true
    setBusy(true)
    const forward = next > page
    const paper = overlay.querySelector<HTMLElement>(forward ? '.notebook-paper-right' : '.notebook-paper-left')!
    const sheet = document.createElement('div')
    sheet.className = `notebook-turn-sheet ${forward ? 'notebook-turn-forward' : 'notebook-turn-backward'}`
    sheet.setAttribute('aria-hidden', 'true')
    sheet.inert = true
    const face = paper.cloneNode(true) as HTMLElement
    face.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'))
    face.querySelector('.notebook-pagination')?.remove()
    face.classList.add('notebook-turn-face')
    const back = document.createElement('div')
    back.className = 'notebook-turn-back'
    sheet.append(face, back)
    overlay.querySelector('.notebook-pages')!.append(sheet)
    turnSheet.current = sheet
    const contents = [...overlay.querySelectorAll<HTMLElement>('.notebook-paper-scroll .notebook-content')]
    const motion = { progress: 0 }
    pageTurn.current = gsap.timeline({
      onComplete: () => {
        gsap.set(contents, { opacity: 1, y: 0 })
        sheet.remove()
        turnSheet.current = null
        pageTurn.current = null
        turning.current = false
        setBusy(false)
      },
    })
      .to(motion, {
        progress: 1,
        duration: .9,
        ease: 'none',
        onUpdate: () => {
          const t = motion.progress
          const progress = smootherstep(t)
          gsap.set(sheet, {
            rotationY: (forward ? -180 : 180) * progress,
            y: -6 * Math.sin(Math.PI * progress),
            opacity: 1 - smootherstep((t - .25) / .5),
          })
        },
      }, 0)
      .to(contents, { opacity: 0, y: forward ? -4 : 4, duration: .2, ease: smootherstep }, 0)
      .call(() => { setPage(next); scroll.scrollTop = 0 }, [], .22)
      .fromTo(contents, { opacity: 0, y: forward ? 8 : -8 }, {
        opacity: 1, y: 0, duration: .54, stagger: .04, ease: smootherstep, immediateRender: false,
      }, .28)
  }

  useLayoutEffect(() => {
    const overlay = overlayRef.current!
    const stage = overlay.querySelector<HTMLElement>('.notebook-stage')!
    const flight = overlay.querySelector<HTMLElement>('.notebook-flight')!
    const cover = overlay.querySelector<HTMLElement>('.notebook-cover')!
    const front = overlay.querySelector<HTMLElement>('.notebook-cover-front')!
    const pages = overlay.querySelector<HTMLElement>('.notebook-pages')!
    const contents = [...overlay.querySelectorAll<HTMLElement>('.notebook-content')]
    const backdrop = overlay.querySelector<HTMLElement>('.notebook-backdrop')!
    const closeButton = closeRef.current!
    const cardFace = overlay.querySelector<HTMLElement>('.notebook-card-face')!
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const app = document.getElementById('root')!
    const originalInert = app.inert
    const source = app.querySelector<HTMLButtonElement>(`[data-flip-id="journey-card-${selection.id}"]`)!
    const originalVisibility = source.style.visibility
    const initialBrightness = getComputedStyle(source.closest('.journey-milestone-visual')!).filter
    const savedScroll = { x: window.scrollX, y: window.scrollY }
    const html = document.documentElement
    const previous = { htmlOverflow: html.style.overflow, scrollBehavior: html.style.scrollBehavior }
    const timelines: gsap.core.Animation[] = []
    let closing = false
    let disposed = false

    // Preserve the exact card typography during the first/last frames of FLIP.
    const cardClone = source.cloneNode(true) as HTMLButtonElement
    const originals = [source, ...source.querySelectorAll<HTMLElement>('*')]
    const clones = [cardClone, ...cardClone.querySelectorAll<HTMLElement>('*')]
    originals.forEach((element, index) => {
      const computed = getComputedStyle(element)
      for (const property of computed) clones[index].style.setProperty(property, computed.getPropertyValue(property))
      clones[index].removeAttribute('id')
      clones[index].removeAttribute('data-flip-id')
    })
    cardClone.style.setProperty('position', 'absolute')
    cardClone.style.setProperty('left', '0')
    cardClone.style.setProperty('top', '0')
    cardClone.style.setProperty('margin', '0')
    cardClone.style.setProperty('transition', 'none')
    cardClone.style.setProperty('transform-origin', '0 0')
    cardClone.style.setProperty('transform', `scale(${flight.clientWidth / source.offsetWidth}, ${flight.clientHeight / source.offsetHeight})`)
    cardClone.style.setProperty('visibility', 'visible')
    cardFace.append(cardClone)

    // The portal is a sibling of #root, so it remains interactive while the app is inert.
    app.inert = true
    // Lock the viewport only. Overflow on body creates a new scroll ancestor
    // and makes the sticky journey disappear at later chapters.
    html.style.overflow = 'hidden'
    source.style.visibility = 'hidden'

    const context = gsap.context(() => {
      const mobile = window.matchMedia('(max-width: 700px)').matches
      gsap.set(stage, { x: mobile ? 0 : -stage.clientWidth / 4 })
      gsap.set(pages, { opacity: 0 })
      gsap.set(contents, { opacity: 0, y: 12 })
      gsap.set(backdrop, { opacity: 0 })
      gsap.set(closeButton, { opacity: 0 })
      gsap.set(front, { backgroundColor: selection.color })
      gsap.set(front, { opacity: 0 })
      gsap.set(cardFace, { filter: initialBrightness })

      if (reducedQuery.matches) {
        gsap.set(stage, { x: 0 })
        gsap.set([pages, ...contents, backdrop, closeButton], { opacity: 1, y: 0 })
        gsap.set(flight, { opacity: 0 })
        turning.current = false
        setBusy(false)
      } else {
        const opening = gsap.timeline({ onComplete: () => { turning.current = false; setBusy(false) } })
        const flip = Flip.from(selection.initialState, {
          targets: flight,
          scale: true,
          duration: .56,
          ease: notebookEase,
          paused: true,
        })
        opening.add(flip.play(), 0)
          .to(backdrop, { opacity: 1, duration: .35, ease: smoothstep }, 0)
          .to(cardFace, { opacity: 0, duration: .2, ease: smoothstep }, .16)
          .to(front, { opacity: 1, duration: .2, ease: smoothstep }, .16)
          .to(front, { backgroundColor: selection.color, borderRadius: 12, duration: .3, ease: notebookEase }, .18)
          .to(stage, { x: 0, duration: .52, ease: notebookEase }, .38)
          .to(pages, { opacity: 1, duration: .28, ease: smoothstep }, .38)
          .to(cover, { rotationY: mobile ? -105 : -175, duration: .54, ease: notebookEase }, .4)
          .to(flight, { opacity: 0, duration: .16, ease: smoothstep }, .8)
          .to(closeButton, { opacity: 1, duration: .2, ease: smoothstep }, .45)

        // Overlapping smoothstep fades follow a small vertical interpolation.
        contents.forEach((content, index) => {
          const fade = { progress: 0 }
          opening.to(fade, {
            progress: 1, duration: .28, ease: 'none',
            onUpdate: () => {
              content.style.opacity = String(smoothstep(fade.progress))
              content.style.transform = `translateY(${lerp(12, 0, fade.progress)}px)`
            },
          }, .6 + index * .08)
        })
        timelines.push(opening, flip)
      }
    }, overlay)

    const restore = () => {
      source.style.visibility = originalVisibility
      app.inert = originalInert
      html.style.overflow = previous.htmlOverflow
      html.style.scrollBehavior = 'auto'
      window.scrollTo(savedScroll.x, savedScroll.y)
      html.style.scrollBehavior = previous.scrollBehavior
      if (source.isConnected) source.focus({ preventScroll: true })
    }

    const finish = () => {
      if (disposed) return
      restore()
      onExited()
    }

    const close = () => {
      if (closing || disposed) return
      closing = true
      turning.current = true
      setBusy(true)
      pageTurn.current?.kill()
      turnSheet.current?.remove()
      timelines.forEach(animation => animation.kill())
      if (reducedQuery.matches) { finish(); return }
      // Re-read the source on close: resize may have changed its position/size.
      const destination = Flip.getState(source)
      const mobile = window.matchMedia('(max-width: 700px)').matches
      const closingTimeline = gsap.timeline({ onComplete: finish })
      closingTimeline
        .to(contents, { opacity: 0, y: 8, duration: .18, ease: smoothstep }, 0)
        .to(closeButton, { opacity: 0, duration: .18 }, 0)
        .to(flight, { opacity: 1, duration: .18 }, 0)
        .to(cover, { rotationY: 0, duration: .32, ease: notebookEase }, 0)
        .to(stage, { x: mobile ? 0 : -stage.clientWidth / 4, duration: .32, ease: notebookEase }, 0)
        .to(pages, { opacity: 0, duration: .12 }, .22)
        .to(front, { backgroundColor: selection.color, borderRadius: 0, duration: .25 }, .3)
        .to(cardFace, { opacity: 1, duration: .2, ease: smoothstep }, .52)
        .to(cardFace, { filter: getComputedStyle(source.closest('.journey-milestone-visual')!).filter, duration: .2 }, .52)
        .to(front, { opacity: 0, duration: .2, ease: smoothstep }, .52)
        .add(() => {
          const returning = Flip.to(destination, { targets: flight, scale: true, duration: .46, ease: notebookEase })
          timelines.push(returning)
        }, .32)
        .to(backdrop, { opacity: 0, duration: .28, ease: smoothstep }, .5)
        .to({}, { duration: .02 }, .78)
      timelines.push(closingTimeline)
    }
    closeAnimation.current = close
    closeButton.focus({ preventScroll: true })

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key !== 'Tab') return
      const focusable = [...overlay.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]')].filter(element => !element.closest('[inert]'))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
        event.preventDefault(); last?.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
        event.preventDefault(); first?.focus()
      }
    }
    const motionChanged = () => {
      if (!reducedQuery.matches || closing) return
      timelines.forEach(animation => animation.kill())
      pageTurn.current?.progress(1)
      turning.current = false
      setBusy(false)
      gsap.set(stage, { x: 0 })
      gsap.set([pages, ...contents, backdrop, closeButton], { opacity: 1, y: 0 })
      gsap.set(flight, { opacity: 0 })
    }
    document.addEventListener('keydown', keydown, true)
    reducedQuery.addEventListener('change', motionChanged)

    return () => {
      disposed = true
      closeAnimation.current = () => {}
      document.removeEventListener('keydown', keydown, true)
      reducedQuery.removeEventListener('change', motionChanged)
      timelines.forEach(animation => animation.kill())
      pageTurn.current?.kill()
      turnSheet.current?.remove()
      context.revert()
      cardClone.remove()
      restore()
    }
  }, [selection, onExited])

  return createPortal(
    <div ref={overlayRef} className="notebook-overlay" role="dialog" aria-modal="true" aria-labelledby="notebook-title" aria-describedby="notebook-description" style={{ '--notebook-accent': selection.color } as CSSProperties}>
      <div className="notebook-backdrop" onClick={() => closeAnimation.current()} aria-hidden="true" />
      <div className="notebook-stage">
        <div className="notebook-pages" data-paginated={pageCount > 1} data-university={isUniversity}>
          <div className="notebook-paper-scroll" tabIndex={0} role="region" aria-label={t('journey.notebook.pages')}>
            <section className="notebook-paper notebook-paper-left">
              <div className="notebook-content">
                <p className="notebook-eyebrow"><ScrambleText text={`${t('journey.chapter')} ${selection.label} / ${t(`${prefix}.episodeTitle`, { defaultValue: t(`${prefix}.title`) })}`} /></p>
                <h2 id="notebook-title"><ScrambleText text={t(`${prefix}.${isUniversity ? 'notebookTitle' : 'title'}`)} /></h2>
                <p id="notebook-description" className="notebook-lead"><ScrambleText text={t(`${prefix}.${isUniversity ? 'degree' : 'description'}`)} />{isUniversity && <><br /><ScrambleText text={t(`${prefix}.faculty`)} /></>}</p>
                <figure className={`notebook-photo${isUniversity ? ' notebook-photo-personal' : ''}`}>
                  <img src={blueTape} className="notebook-tape" alt="" aria-hidden="true" />
                  <img src={isUniversity ? universityPhoto : selection.image ?? sign} alt={t(`journey.notebook.images.${selection.id}`)} />
                  <figcaption><ScrambleText text={t(`${prefix}.period`)} /></figcaption>
                </figure>
                <p><ScrambleText text={t(`${prefix}.story`)} /></p>
                <span className="notebook-page-number">{String(page * 2 + 1).padStart(2, '0')} / STORY</span>
              </div>
            </section>
            <section className="notebook-paper notebook-paper-right">
              {pageCount > 1 && <nav className="notebook-pagination" aria-label={t('journey.notebook.pageNavigation')}>
                <button type="button" disabled={busy || page === 0} onClick={() => turnPage(page - 1)} aria-label={t('journey.notebook.previousPage')}><ArrowLeft size={20} aria-hidden="true" /></button>
                <span role="status" aria-live="polite" aria-atomic="true">{t('journey.notebook.pageIndicator', { current: page + 1, total: pageCount })}</span>
                <button type="button" disabled={busy || page === pageCount - 1} onClick={() => turnPage(page + 1)} aria-label={t('journey.notebook.nextPage')}><ArrowRight size={20} aria-hidden="true" /></button>
              </nav>}
              <div className="notebook-content">
                <img src={bookmark} className="notebook-bookmark" alt="" aria-hidden="true" />
                <img src={paperclip} className="notebook-paperclip" alt="" aria-hidden="true" />
                <h3><ScrambleText text={t('journey.highlights')} /></h3>
                <ul className="notebook-memories">{[0, 1, 2].map(index => <li key={index}><span>0{index + 1}</span><ScrambleText text={t(`${prefix}.highlights.${index}`)} /></li>)}</ul>
                <div className="notebook-memory-note"><img src={starSticker} alt="" aria-hidden="true" /><div><h3><ScrambleText text={t('journey.notebook.memory')} /></h3><p><ScrambleText text={t(`${prefix}.memory`)} /></p></div></div>
                <div className="notebook-takeaway"><img src={arrowSticker} alt="" aria-hidden="true" /><p><strong><ScrambleText text={t('journey.takeaway')} /></strong><br /><ScrambleText text={t(`${prefix}.takeaway`)} /></p></div>
                <p className="notebook-tags"><ScrambleText text={t(`${prefix}.tag`)} /></p>
                <img src={heartSticker} className="notebook-heart-sticker" alt="" aria-hidden="true" />
                <img src={car} className="notebook-car-sticker" alt="" aria-hidden="true" />
                <span className="notebook-page-number">{String(page * 2 + 2).padStart(2, '0')} / MEMORIES</span>
              </div>
            </section>
          </div>
          <div className="notebook-spine" aria-hidden="true"><i /><i /><i /></div>
        </div>
        <div className="notebook-flight" data-flip-id={`journey-card-${selection.id}`} aria-hidden="true">
          <div className="notebook-cover">
            <div className="notebook-cover-front"><span><ScrambleText text={t('journey.chapter')} /> {selection.label}</span><BookOpen size={42} strokeWidth={3} /><h3><ScrambleText text={t(`${chapterPrefix}.title`)} /></h3><p><ScrambleText text={t(`${chapterPrefix}.shortDescription`)} /></p><span className="notebook-cover-label">JOURNEY / NOTES</span></div>
            <div className="notebook-cover-back" />
          </div>
          <div className="notebook-card-face" inert />
        </div>
        <button ref={closeRef} type="button" className="notebook-close" onClick={() => closeAnimation.current()} aria-label={t('journey.notebook.close')}><img src={closeIcon} alt="" aria-hidden="true" /></button>
      </div>
    </div>, document.body,
  )
}
