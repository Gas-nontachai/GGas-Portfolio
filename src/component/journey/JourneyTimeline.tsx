import { useRef, useState, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ArrowDown, ArrowRight, Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import car from '../../assets/journey_timeline/journey_car_side.png'
import university from '../../assets/journey_timeline/university.png'
import office from '../../assets/journey_timeline/office_building.png'
import busStop from '../../assets/journey_timeline/future_bus_stop.png'
import tree from '../../assets/journey_timeline/tree_round.png'
import tallTree from '../../assets/journey_timeline/tree_tall.png'
import bush from '../../assets/journey_timeline/bush.png'
import cloud from '../../assets/journey_timeline/cloud_large.png'
import smallCloud from '../../assets/journey_timeline/cloud_small.png'
import lamp from '../../assets/journey_timeline/street_lamp.png'
import sign from '../../assets/journey_timeline/direction_sign.png'
import barrier from '../../assets/journey_timeline/construction_barrier.png'
import dust from '../../assets/journey_timeline/dust_small.png'
import './journey.css'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin)

const milestones = [
  { id: 'university', image: university, color: '#ffe16b', label: '01' },
  { id: 'firstJob', image: office, color: '#ff9cba', label: '02' },
  { id: 'present', image: office, color: '#b6db94', label: '03' },
  { id: 'future', image: busStop, color: '#a5dff5', label: '04' },
] as const

export default function JourneyTimeline() {
  const { t } = useTranslation()
  const section = useRef<HTMLElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const navigationTween = useRef<gsap.core.Tween | null>(null)
  const focusIndex = useRef(0)
  const [focused, setFocused] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)

  useGSAP(() => {
    const root = section.current!
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
      let previousProgress = 0
      let lastPercentage = -1
      const position = { progress: 0 }
      const setWorldX = gsap.quickSetter(world, 'x', 'px')
      const setSkyX = gsap.quickSetter(sky, 'x', 'px')
      const setWheels = gsap.quickSetter(wheels, 'rotation', 'deg')
      const setProgress = gsap.quickSetter(progressBar, 'scaleX')
      const stopDust = gsap.delayedCall(0.15, () => { vehicle.dataset.moving = 'false' }).pause()

      const render = () => {
        const progress = position.progress
        setWorldX(-travel * progress)
        setSkyX(reduced ? 0 : -travel * progress * 0.22)
        setWheels(reduced ? 0 : travel * progress * 1.5)
        setProgress(progress)
        const nextPercentage = Math.round(progress * 100)
        if (lastPercentage !== nextPercentage) {
          percentage.textContent = `${nextPercentage}%`
          lastPercentage = nextPercentage
        }
        const nextFocus = Math.min(milestones.length - 1, Math.round(progress * (milestones.length - 1)))
        if (focusIndex.current !== nextFocus) {
          focusIndex.current = nextFocus
          setFocused(nextFocus)
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
          trigger: root,
          start: 'top top',
          end: () => `+=${Math.max(2400, travel * 1.5)}`,
          pin: true,
          scrub: reduced ? true : 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onRefresh: render,
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
        vehicle.dataset.moving = 'false'
        trigger.current = null
      }
    })

    return () => media.revert()
  }, { scope: section })

  const goToMilestone = (index: number) => {
    const scrollTrigger = trigger.current
    if (!scrollTrigger) return
    navigationTween.current?.kill()
    navigationTween.current = gsap.to(window, {
      scrollTo: { y: scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * index / (milestones.length - 1), autoKill: true },
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.8,
      ease: 'power2.inOut',
    })
  }

  return (
    <section ref={section} id="journey" className="journey" aria-labelledby="journey-heading">
      <header className="journey-header">
        <div>
          <p className="journey-eyebrow"><span /> {t('journey.eyebrow')}</p>
          <h2 id="journey-heading">{t('journey.heading')}<span>.</span></h2>
        </div>
        <p className="journey-instruction"><ArrowDown size={18} aria-hidden="true" />{t('journey.scroll')}<ArrowRight size={18} aria-hidden="true" /></p>
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
                data-state={state}
                style={{ '--stage-index': index, '--stage-color': milestone.color } as CSSProperties}
                onPointerEnter={(event) => { if (event.pointerType !== 'touch') setHovered(index) }}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                tabIndex={index === focused ? 0 : -1}
                aria-label={`${milestone.label}: ${t(`journey.stages.${milestone.id}.title`)}`}
              >
                <div className="journey-milestone-visual">
                  <div className="journey-card">
                    <div className="journey-card-meta"><span>{t('journey.chapter')} {milestone.label}</span><span className="journey-state-label">{t(`journey.${state === 'focused' ? 'here' : state === 'hovered' ? 'preview' : 'stop'}`)}</span></div>
                    <h3>{t(`journey.stages.${milestone.id}.title`)}</h3>
                    <div className="journey-card-copy" aria-hidden={state === 'inactive'}>
                      <p>{t(`journey.stages.${milestone.id}.${state === 'hovered' ? 'preview' : 'description'}`)}</p>
                      <span className="journey-card-tag">{t(`journey.stages.${milestone.id}.tag`)}</span>
                    </div>
                  </div>
                  <img src={milestone.image} alt="" className="journey-building" draggable={false} />
                </div>
                <div className="journey-stop-marker" aria-hidden="true">{milestone.label}</div>
              </article>
            )
          })}

          <div className="journey-decorations" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <div className="journey-decoration-group" key={index} style={{ left: `calc(var(--journey-origin) + var(--journey-spacing) * ${index * 0.5 - 0.25})` }}>
                <img src={index % 2 ? tallTree : tree} className="journey-tree" alt="" draggable={false} />
                <img src={bush} className="journey-bush" alt="" draggable={false} />
                <img src={index === 6 ? barrier : index % 3 === 0 ? sign : lamp} className="journey-roadside" alt="" draggable={false} />
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
        <div className="journey-status"><Flag size={17} aria-hidden="true" /><span>{t('journey.chapter')} {milestones[focused].label} / 04</span><span className="journey-percent" aria-hidden="true">0%</span></div>
        <div className="journey-progress" aria-hidden="true"><div className="journey-progress-fill" /></div>
        <nav className="journey-stops" aria-label={t('journey.navigation')}>
          {milestones.map((milestone, index) => <button type="button" key={milestone.id} aria-current={index === focused ? 'step' : undefined} onClick={() => goToMilestone(index)}><span>{milestone.label}</span><span>{t(`journey.stages.${milestone.id}.title`)}</span></button>)}
        </nav>
      </footer>
      <p className="journey-sr-only" aria-live="polite" aria-atomic="true">{t(`journey.stages.${milestones[focused].id}.title`)}. {t(`journey.stages.${milestones[focused].id}.description`)}</p>
    </section>
  )
}
