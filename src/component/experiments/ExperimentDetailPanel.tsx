import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Braces, Check, Cpu, Film, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { experiments } from './experiments.config'
import type { Experiment } from './experiments.config'
import type { ExperimentId } from './experimentSelection'
import ScrambleText from '../ScrambleText'

const icons = { flutter: Braces, esp32: Cpu, printing: Printer, davinci: Film }

function PanelContent({
  experiment,
  selected,
  sizing = false,
}: {
  experiment: Experiment
  selected: boolean
  sizing?: boolean
}) {
  const { t } = useTranslation()
  const Icon = icons[experiment.id]
  const renderText = (text: string) => (sizing ? text : <ScrambleText text={text} />)
  return (
    <>
      <div className="experiment-panel-top">
        <h3 id={sizing ? undefined : 'experiment-detail-title'}>
          <Icon aria-hidden="true" />
          {renderText(experiment.title)}
        </h3>
        <span className="experiment-panel-status">
          <span className="experiment-dot" />
          {renderText(t(`experiments.status.${experiment.status}`))}
        </span>
      </div>
      <p className="experiment-panel-description">
        {renderText(t(`${experiment.translationKey}.description`))}
      </p>
      <ul className="experiment-highlights">
        {[0, 1, 2].map((index) => (
          <li key={index}>
            <span className="experiment-highlight-marker" aria-hidden="true" />
            {renderText(t(`${experiment.translationKey}.highlights.${index}`))}
          </li>
        ))}
      </ul>
      <p className="experiment-panel-hint">
        <Check size={16} aria-hidden="true" />
        <span className="experiment-hint-pointer">
          {renderText(t(selected ? 'experiments.locked' : 'experiments.preview'))}
        </span>
        <span className="experiment-hint-touch">{renderText(t('experiments.touchHint'))}</span>
      </p>
    </>
  )
}

export default function ExperimentDetailPanel({
  activeId,
  selectedId,
}: {
  activeId: ExperimentId
  selectedId: ExperimentId
}) {
  const [displayedId, setDisplayedId] = useState(activeId)
  const displayed = useRef(activeId)
  const content = useRef<HTMLDivElement>(null)

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
      style={{ '--panel-color': experiment.color } as CSSProperties}
      aria-labelledby="experiment-detail-title"
      data-experiment-panel
    >
      {/* Invisible grid cells reserve the tallest translated item without fixed clipping. */}
      <div className="experiment-panel-sizer" aria-hidden="true" inert>
        {experiments.map((item) => (
          <div className="experiment-panel-content" key={item.id}>
            <PanelContent experiment={item} selected sizing />
          </div>
        ))}
      </div>
      <div ref={content} className="experiment-panel-content">
        <PanelContent experiment={experiment} selected={displayedId === selectedId} />
      </div>
    </aside>
  )
}
