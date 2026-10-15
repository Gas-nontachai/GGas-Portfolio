import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Braces, Cpu, Film, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { experiments } from './experiments.config'
import type { Experiment } from './experiments.config'
import type { ExperimentId } from './experimentSelection'
import ScrambleText from '../ScrambleText'

const icons = { flutter: Braces, esp32: Cpu, printing: Printer, davinci: Film }

function PanelContent({
  experiment,
  scrollRef,
}: {
  experiment: Experiment
  scrollRef: RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()
  const Icon = icons[experiment.id]
  return (
    <>
      <div className="experiment-panel-top">
        <h3 id="experiment-detail-title">
          <Icon aria-hidden="true" />
          <ScrambleText text={experiment.title} />
        </h3>
        <span className="experiment-panel-status">
          <span className="experiment-dot" />
          <ScrambleText text={t(`experiments.status.${experiment.status}`)} />
        </span>
      </div>
      <div
        ref={scrollRef}
        className="experiment-panel-scroll"
        role="region"
        aria-labelledby="experiment-detail-title"
        tabIndex={0}
      >
        <p className="experiment-panel-description">
          <ScrambleText text={t(`${experiment.translationKey}.description`)} />
        </p>
        <ul className="experiment-highlights">
          {[0, 1, 2, 3].map((index) => (
            <li key={index}>
              <span className="experiment-highlight-marker" aria-hidden="true" />
              <ScrambleText text={t(`${experiment.translationKey}.highlights.${index}`)} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default function ExperimentDetailPanel({ activeId }: { activeId: ExperimentId }) {
  const [displayedId, setDisplayedId] = useState(activeId)
  const displayed = useRef(activeId)
  const content = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0
  }, [displayedId])

  useGSAP(
    () => {
      const node = content.current
      if (!node) return
      const media = gsap.matchMedia()
      media.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          motion: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const update = () => {
            displayed.current = activeId
            setDisplayedId(activeId)
          }
          if (context.conditions?.reduced) {
            update()
            gsap.set(node, { opacity: 1, y: 0 })
            return
          }
          if (displayed.current === activeId) {
            gsap.to(node, { opacity: 1, y: 0, duration: 0.18, overwrite: true })
            return
          }
          gsap
            .timeline()
            .to(node, { opacity: 0, y: -6, duration: 0.12, onComplete: update })
            .set(node, { y: 8 })
            .to(node, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' })
        },
      )
      return () => media.revert()
    },
    { scope: content, dependencies: [activeId], revertOnUpdate: true },
  )

  const experiment = experiments.find(({ id }) => id === displayedId)!
  return (
    <aside
      id="experiment-detail"
      className="experiment-panel"
      style={
        {
          '--panel-color': experiment.color,
          '--experiment-color': experiment.color,
        } as CSSProperties
      }
      aria-labelledby="experiment-detail-title"
      data-experiment-panel
    >
      <div ref={content} className="experiment-panel-content">
        <PanelContent experiment={experiment} scrollRef={scroller} />
      </div>
    </aside>
  )
}
