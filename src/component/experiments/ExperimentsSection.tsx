import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { ArrowDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import ExperimentScene from './ExperimentScene'
import ExperimentDetailPanel from './ExperimentDetailPanel'
import { experiments } from './experiments.config'
import { getPreviewExperiment, initialSelection, selectionReducer } from './experimentSelection'
import {
  createExperimentEntranceCapture,
  createScrollVelocityTracker,
  getExperimentAttractionMotion,
} from './experimentScroll'
import { getExperimentSceneScale } from './experimentLayout'
import ScrambleText from '../ScrambleText'
import './experiments.css'

gsap.registerPlugin(ScrollToPlugin)

export default function ExperimentsSection({ ready = true }: { ready?: boolean }) {
  const { t } = useTranslation()
  const section = useRef<HTMLElement>(null)
  const [selection, dispatch] = useReducer(selectionReducer, initialSelection)
  const [running, setRunning] = useState(false)

  const fitScene = useCallback(() => {
    const node = section.current
    if (!node) return
    node.style.setProperty(
      '--experiment-scene-scale',
      String(getExperimentSceneScale(node.clientWidth, node.clientHeight)),
    )
  }, [])

  useLayoutEffect(() => {
    const node = section.current
    if (!node) return
    fitScene()
    const observer = new ResizeObserver(fitScene)
    observer.observe(node)
    return () => {
      observer.disconnect()
      node.style.removeProperty('--experiment-scene-scale')
    }
  }, [fitScene])

  useEffect(() => {
    const node = section.current
    if (!node || !ready) return
    let inView = false
    const update = () => setRunning(inView && !document.hidden)
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        update()
      },
      { threshold: 0.05 },
    )
    observer.observe(node)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [ready])

  useGSAP(
    () => {
      const node = section.current
      if (!node || !ready) return
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const capture = createExperimentEntranceCapture(window.scrollY)
        const measureVelocity = createScrollVelocityTracker(window.scrollY, performance.now())
        let scrollTween: gsap.core.Tween | null = null
        let scrollFrame = 0
        let settleTimer = 0
        const stopCapture = () => {
          window.clearTimeout(settleTimer)
          settleTimer = 0
          scrollTween?.kill()
          scrollTween = null
          window.removeEventListener('wheel', handleWheel)
          window.removeEventListener('pointerdown', stopCapture)
          window.removeEventListener('keydown', handleKey)
          window.removeEventListener('resize', stopCapture)
        }
        const handleWheel = (event: WheelEvent) => {
          if (event.target instanceof Element && event.target.closest('.experiment-panel-scroll')) {
            stopCapture()
            return
          }
          if (event.ctrlKey || event.deltaY < 0) stopCapture()
          else if (event.deltaY > 0) event.preventDefault()
        }
        const handleKey = (event: KeyboardEvent) => {
          if (
            ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)
          )
            stopCapture()
        }
        const handleScroll = () => {
          if (scrollFrame) return
          scrollFrame = window.requestAnimationFrame(() => {
            scrollFrame = 0
            const velocity = measureVelocity(window.scrollY, performance.now())
            const target = capture({
              scrollY: window.scrollY,
              sectionTop: node.getBoundingClientRect().top,
              viewportHeight: window.innerHeight,
            })
            if (target === null || scrollTween?.isActive()) return
            const motion = getExperimentAttractionMotion(target - window.scrollY, velocity)
            if (!motion.duration) return
            fitScene()
            // Finish revealing the controls as the viewport arrives, rather than after it.
            if (timeline.progress() < 1) {
              timeline.timeScale((timeline.duration() - timeline.time()) / motion.duration).play()
            }
            // Keep the tail of the entering gesture from interrupting the capture.
            window.addEventListener('wheel', handleWheel, { passive: false })
            window.addEventListener('pointerdown', stopCapture)
            window.addEventListener('keydown', handleKey)
            window.addEventListener('resize', stopCapture)
            scrollTween = gsap.to(window, {
              scrollTo: { y: target, autoKill: false },
              duration: motion.duration,
              ease: motion.ease,
              onComplete: () => {
                scrollTween = null
                fitScene()
                // Resolve the final position against the current layout, not the starting snapshot.
                gsap.set(window, { scrollTo: { y: node, autoKill: false } })
                // Drain the entering gesture's tail; clicks and reverse scrolling still release immediately.
                settleTimer = window.setTimeout(stopCapture, 160)
              },
            })
          })
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        const timeline = gsap
          .timeline({ paused: true })
          .from('[data-experiment-heading]', { opacity: 0, y: 22, duration: 0.5 })
          .from('[data-experiment-avatar]', { opacity: 0, y: 16, duration: 0.5 }, '-=0.25')
          .from(
            '[data-experiment-reveal]',
            { opacity: 0, y: 18, duration: 0.45, stagger: 0.055 },
            '-=0.3',
          )
          .from('[data-experiment-panel]', { opacity: 0, x: 16, duration: 0.45 }, '-=0.3')
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return
            timeline.play()
            observer.disconnect()
          },
          { threshold: 0.1 },
        )
        observer.observe(node)
        return () => {
          observer.disconnect()
          stopCapture()
          window.cancelAnimationFrame(scrollFrame)
          window.removeEventListener('scroll', handleScroll)
        }
      })
      return () => media.revert()
    },
    { scope: section, dependencies: [ready, fitScene], revertOnUpdate: true },
  )

  const explore = () => {
    const first = section.current?.querySelector<HTMLButtonElement>(
      '[data-experiment-id="flutter"]',
    )
    if (!first) return
    first.focus({ preventScroll: true })
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth'
    if (Math.abs(section.current!.getBoundingClientRect().top) > 1) {
      section.current!.scrollIntoView({ behavior, block: 'start' })
    }
    dispatch({ type: 'focus', id: 'flutter' })
  }

  return (
    <section
      ref={section}
      id="current-experiments"
      className="experiments-section"
      aria-labelledby="experiments-heading"
      data-running={running}
    >
      <div className="experiments-layout">
        <header className="experiments-heading" data-experiment-heading>
          <p className="experiments-eyebrow">
            <span className="experiments-section-marker" aria-hidden="true" />
            <ScrambleText text={`03 / ${t('experiments.eyebrow')}`} />
          </p>
          <h2 id="experiments-heading">
            <ScrambleText text="My Current" />
            <br />
            <ScrambleText text="Experiments" />
            <span className="experiments-period">.</span>
          </h2>
          <p className="experiments-intro">
            <ScrambleText text={t('experiments.description')} />
          </p>
          <button className="experiments-explore" type="button" onClick={explore}>
            <ScrambleText text={t('experiments.explore')} />
            <ArrowDownRight aria-hidden="true" />
          </button>
        </header>
        <p id="experiments-choose" className="experiments-sr-only">
          {t('experiments.choose')}
        </p>
        <ExperimentScene selection={selection} dispatch={dispatch} />
        <ExperimentDetailPanel activeId={getPreviewExperiment(selection)} />
      </div>
      <p className="experiments-sr-only" role="status">
        {t('experiments.selected', {
          title: experiments.find(({ id }) => id === selection.selected)!.title,
        })}
      </p>
    </section>
  )
}
