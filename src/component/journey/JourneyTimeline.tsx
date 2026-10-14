import { useCallback, useRef, useState, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Flip } from 'gsap/Flip'
import { ArrowDown, ArrowLeft, ArrowRight, Flag, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ScrambleText from '../ScrambleText'
import car from '../../assets/journey_timeline/journey_car_side.png'
import university from '../../assets/journey_timeline/university.png'
import office from '../../assets/journey_timeline/office_building.png'
import tree from '../../assets/journey_timeline/tree_round.png'
import tallTree from '../../assets/journey_timeline/tree_tall.png'
import bush from '../../assets/journey_timeline/bush.png'
import cloud from '../../assets/journey_timeline/cloud_large.png'
import smallCloud from '../../assets/journey_timeline/cloud_small.png'
import lamp from '../../assets/journey_timeline/street_lamp.png'
import sign from '../../assets/journey_timeline/direction_sign.png'
import barrier from '../../assets/journey_timeline/construction_barrier.png'
import dust from '../../assets/journey_timeline/dust_small.png'
import { getJourneyFrame, getMilestoneScrollProgress } from './journeyMotion'
import JourneyNotebook, { type NotebookSelection } from './JourneyNotebook'
import './journey.css'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, Flip)

const milestones = [
  { id: 'university', image: university, color: '#ffe16b', label: '01' },
  { id: 'career', image: office, color: '#b6db94', label: '02' },
  { id: 'future', image: null, color: '#a5dff5', label: '03' },
] as const
const decorationCount = milestones.length * 2 - 1

export default function JourneyTimeline() {
  const { t } = useTranslation()
  const section = useRef<HTMLElement>(null)
  const scrollShell = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const navigationTween = useRef<gsap.core.Tween | null>(null)
  const navigationArrival = useRef<(() => void) | null>(null)
  const focusIndex = useRef(0)
  const arrivalState = useRef(false)
  const [focused, setFocused] = useState(0)
  const [arrived, setArrived] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const [notebook, setNotebook] = useState<NotebookSelection | null>(null)
  const closeNotebook = useCallback(() => setNotebook(null), [])

  const openNotebook = (index: number, source: HTMLButtonElement) => {
    if (notebook) return
    const showNotebook = () => {
      if (!source.isConnected) return
      // Resolve any remaining card scale transition before taking the FLIP snapshot.
      source.closest('.journey-milestone-visual')?.getAnimations().forEach(animation => animation.finish())
      const milestone = milestones[index]
      setNotebook({ ...milestone, source, initialRect: source.getBoundingClientRect(), initialState: Flip.getState(source) })
    }
    if (focusIndex.current === index && !navigationTween.current?.isActive() && !trigger.current?.getTween()?.isActive()) {
      navigationArrival.current = null
      showNotebook()
      return
    }
    goToMilestone(index, showNotebook)
  }

  const finishNavigation = () => {
    const onArrival = navigationArrival.current
    navigationArrival.current = null
    if (onArrival && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) trigger.current?.getTween()?.duration(.65)
    onArrival?.()
  }

  useGSAP(() => {
    const root = section.current!
    const shell = scrollShell.current!
    const viewport = scene.current!
    const world = root.querySelector<HTMLElement>('.journey-world')!
    const sky = root.querySelector<HTMLElement>('.journey-sky')!
    const vehicle = root.querySelector<HTMLElement>('.journey-car')!
    const progressBar = root.querySelector<HTMLElement>('.journey-progress-fill')!
    const percentage = root.querySelector<HTMLElement>('.journey-percent')!
    const wheels = root.querySelectorAll('.journey-wheel')
    const media = gsap.matchMedia()

    media.add({ reduced: '(prefers-reduced-motion: reduce)', animated: '(prefers-reduced-motion: no-preference)' }, (context) => {
      const reduced = Boolean(context.conditions?.reduced)
      let spacing = 0
      let travel = 0
      let scrollDistance = 2400
      let previousProgress = 0
      let lastPercentage = -1
      const position = { progress: 0 }
      const setWorldX = gsap.quickSetter(world, 'x', 'px')
      const setSkyX = gsap.quickSetter(sky, 'x', 'px')
      const setWheels = gsap.quickSetter(wheels, 'rotation', 'deg')
      const setProgress = gsap.quickSetter(progressBar, 'scaleX')
      const stopDust = gsap.delayedCall(0.15, () => { vehicle.dataset.moving = 'false' }).pause()

      const render = () => {
        const frame = getJourneyFrame(position.progress, milestones.length, spacing)
        const { progress } = frame
        setWorldX(-frame.distance)
        setSkyX(reduced ? 0 : -frame.distance * 0.22)
        setWheels(reduced ? 0 : frame.distance * 1.5)
        setProgress(progress)
        const nextPercentage = frame.percentage
        if (lastPercentage !== nextPercentage) {
          percentage.textContent = `${nextPercentage}%`
          lastPercentage = nextPercentage
        }
        const nextFocus = frame.focused
        if (focusIndex.current !== nextFocus) {
          focusIndex.current = nextFocus
          setFocused(nextFocus)
        }
        if (arrivalState.current !== frame.arrived) {
          arrivalState.current = frame.arrived
          setArrived(frame.arrived)
        }
        if (!reduced && Math.abs(progress - previousProgress) > 0.00001) {
          vehicle.dataset.moving = 'true'
          vehicle.dataset.direction = progress >= previousProgress ? 'forward' : 'backward'
          stopDust.restart(true)
        }
        previousProgress = progress
      }

      const measure = () => {
        const width = viewport.clientWidth
        spacing = Math.max(370, Math.min(760, width * 0.66))
        travel = spacing * (milestones.length - 1)
        scrollDistance = Math.max(2400, travel * 1.5)
        // Reserve real document height; sticky releases at the shell's end.
        shell.style.height = `${root.offsetHeight + scrollDistance}px`
        root.style.setProperty('--journey-spacing', `${spacing}px`)
        root.style.setProperty('--journey-origin', `${width / 2}px`)
        world.style.width = `${width + travel}px`
        render()
      }

      measure()
      const animation = gsap.fromTo(position, { progress: 0 }, {
        progress: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: {
          id: 'portfolio-journey',
          trigger: shell,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: reduced ? true : 0.65,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onRefresh: render,
          onScrubComplete: () => {
            if (navigationTween.current?.isActive()) return
            finishNavigation()
          },
        },
      })
      trigger.current = animation.scrollTrigger!
      // Font loading can change the height of the portfolio above the pinned scene.
      let disposed = false
      void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh() })

      return () => {
        disposed = true
        stopDust.kill()
        navigationTween.current?.kill()
        navigationArrival.current = null
        vehicle.dataset.moving = 'false'
        shell.style.removeProperty('height')
        trigger.current = null
      }
    })

    return () => media.revert()
  }, { scope: section })

  const goToMilestone = (index: number, onArrival?: () => void) => {
    if (index < 0 || index >= milestones.length) return
    const scrollTrigger = trigger.current
    if (!scrollTrigger) return
    navigationTween.current?.kill()
    navigationArrival.current = onArrival ?? null
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) scrollTrigger.getTween()?.duration(onArrival ? .2 : .65)
    navigationTween.current = gsap.to(window, {
      scrollTo: {
        y: scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * getMilestoneScrollProgress(index, milestones.length),
        autoKill: true,
        onAutoKill: () => {
          navigationArrival.current = null
          if (!reduced) scrollTrigger.getTween()?.duration(.65)
        },
      },
      duration: reduced ? 0 : onArrival ? .55 : .8,
      ease: 'power2.inOut',
      onComplete: () => {
        ScrollTrigger.update()
        if (scrollTrigger.getTween()?.isActive()) return
        finishNavigation()
      },
    })
  }

  return (
    <div ref={scrollShell} className="journey-scroll-shell">
    <section ref={section} id="journey" className="journey" data-arrived={arrived} aria-labelledby="journey-heading">
      <header className="journey-header">
        <div>
          <p className="journey-eyebrow"><span /> <ScrambleText text={t('journey.eyebrow')} /></p>
          <h2 id="journey-heading"><ScrambleText text={t('journey.heading')} /><span className="journey-heading-dot">.</span></h2>
        </div>
        <nav className="journey-instruction" aria-label={t('journey.navigation')}>
          <button type="button" disabled={focused === 0} onClick={() => goToMilestone(focused - 1)} aria-label={t('journey.previous')} title={t('journey.previous')}><ArrowLeft size={24} strokeWidth={2.5} aria-hidden="true" /></button>
          <button type="button" disabled={focused === milestones.length - 1} onClick={() => goToMilestone(focused + 1)} aria-label={t('journey.next')} title={t('journey.next')}><ArrowRight size={24} strokeWidth={2.5} aria-hidden="true" /></button>
        </nav>
      </header>

      <div ref={scene} className="journey-scene">
        <div className="journey-sky" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <img key={index} src={index % 2 ? smallCloud : cloud} className="journey-cloud" style={{ left: `${index * 420 + 40}px`, top: `${index % 3 * 25 + 10}px`, width: `${index % 2 ? 105 : 165}px` }} alt="" draggable={false} />)}
          <div className="journey-hill journey-hill-one" /><div className="journey-hill journey-hill-two" /><div className="journey-hill journey-hill-three" />
        </div>
        <div className="journey-ground" aria-hidden="true" />

        <div className="journey-world">
          <div className="journey-road" aria-hidden="true"><div className="journey-road-lines" /></div>
          {milestones.map((milestone, index) => {
            const state = index === focused ? 'focused' : index === hovered ? 'hovered' : 'inactive'
            return (
              <article
                key={milestone.id}
                className="journey-milestone"
                data-stage={milestone.id}
                data-state={state}
                style={{ '--stage-index': index, '--stage-color': milestone.color } as CSSProperties}
                onPointerEnter={(event) => { if (event.pointerType !== 'touch') setHovered(index) }}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-label={`${milestone.label}: ${t(`journey.stages.${milestone.id}.title`)}`}
              >
                <div className="journey-milestone-visual">
                  <button type="button" className="journey-card" data-flip-id={`journey-card-${milestone.id}`} tabIndex={index === focused ? 0 : -1} onClick={event => openNotebook(index, event.currentTarget)} aria-label={t('journey.notebook.open', { stage: t(`journey.stages.${milestone.id}.title`) })} aria-haspopup="dialog">
                    <span className="journey-card-meta"><span><ScrambleText text={t('journey.chapter')} /> {milestone.label}</span><span className="journey-state-label"><ScrambleText text={t(`journey.${state === 'focused' ? 'here' : state === 'hovered' ? 'preview' : 'stop'}`)} /></span></span>
                    <span className="journey-card-title"><ScrambleText text={t(`journey.stages.${milestone.id}.title`)} /></span>
                    <span className="journey-card-copy">
                      <span className="journey-card-summary"><ScrambleText text={t(`journey.stages.${milestone.id}.${state === 'hovered' ? 'preview' : 'shortDescription'}`)} /></span>
                      <span className="journey-card-tag"><ScrambleText text={t('journey.notebook.read')} /></span>
                    </span>
                  </button>
                  {milestone.image ? <img src={milestone.image} alt="" className="journey-building" draggable={false} /> : (
                    <div className="journey-building journey-future-sign" aria-hidden="true">
                      <div className="journey-future-board"><span className="journey-future-question">?</span><span>NEXT<br /><strong>???</strong></span><ArrowRight size={36} strokeWidth={3} /></div>
                    </div>
                  )}
                </div>
                <div className="journey-stop-marker" aria-hidden="true">{milestone.label}</div>
              </article>
            )
          })}

          <div className="journey-decorations" aria-hidden="true">
            {Array.from({ length: decorationCount }, (_, index) => (
              <div className="journey-decoration-group" key={index} style={{ left: `calc(var(--journey-origin) + var(--journey-spacing) * ${index * 0.5 - 0.25})` }}>
                <img src={index % 2 ? tallTree : tree} className="journey-tree" alt="" draggable={false} />
                <img src={bush} className="journey-bush" alt="" draggable={false} />
                <img src={index === decorationCount - 2 ? barrier : index === decorationCount - 1 || index % 3 === 0 ? sign : lamp} className="journey-roadside" alt="" draggable={false} />
              </div>
            ))}
          </div>
        </div>

        <div className="journey-car" data-moving="false" aria-hidden="true">
          <div className="journey-dust"><img src={dust} alt="" /><img src={dust} alt="" /><img src={dust} alt="" /></div>
          <img src={car} className="journey-car-body" alt="" draggable={false} />
          <span className="journey-wheel journey-wheel-rear" /><span className="journey-wheel journey-wheel-front" />
        </div>
        <span className="journey-road-caption" aria-hidden="true">THANGGAS / LIFE IN MOTION</span>
      </div>

      <footer className="journey-hud">
        <div className="journey-status"><Flag size={17} aria-hidden="true" /><span><ScrambleText text={t('journey.chapter')} /> {milestones[focused].label} / {String(milestones.length).padStart(2, '0')}</span><span className="journey-percent" aria-hidden="true">0%</span></div>
        <div className="journey-progress" aria-hidden="true"><div className="journey-progress-fill" /></div>
        <nav className="journey-stops" aria-label={t('journey.navigation')}>
          {milestones.map((milestone, index) => <button type="button" key={milestone.id} aria-current={index === focused ? 'step' : undefined} onClick={() => goToMilestone(index)}><span>{milestone.label}</span><span><ScrambleText text={t(`journey.stages.${milestone.id}.title`)} /></span></button>)}
        </nav>
        <div className="journey-ending" inert={!arrived} aria-hidden={!arrived}>
          <span><Flag size={15} aria-hidden="true" /><ScrambleText text={t('journey.continued')} /></span>
          <div className="journey-ending-actions">
            <button type="button" onClick={() => goToMilestone(0)}><RotateCcw size={14} aria-hidden="true" /><ScrambleText text={t('journey.replay')} /></button>
            <a href="#after-journey"><ScrambleText text={t('journey.continue')} /><ArrowDown size={14} aria-hidden="true" /></a>
          </div>
        </div>
      </footer>
      <p className="journey-sr-only" aria-live="polite" aria-atomic="true">{t(`journey.stages.${milestones[focused].id}.title`)}. {t(`journey.stages.${milestones[focused].id}.description`)} {arrived ? t('journey.arrival') : ''}</p>
    </section>
    {notebook && <JourneyNotebook selection={notebook} onExited={closeNotebook} />}
    </div>
  )
}
