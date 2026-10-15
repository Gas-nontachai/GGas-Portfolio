import { useState } from 'react'
import type { CSSProperties, Dispatch } from 'react'
import { useTranslation } from 'react-i18next'
import type { Experiment } from './experiments.config'
import type { SelectionAction } from './experimentSelection'
import ScrambleText from '../ScrambleText'

type Props = {
  experiment: Experiment
  selected: boolean
  previewed: boolean
  dispatch: Dispatch<SelectionAction>
}

export default function ExperimentObject({ experiment, selected, previewed, dispatch }: Props) {
  const { t } = useTranslation()
  const [tooltipDismissed, setTooltipDismissed] = useState(false)
  const { id, title, asset, width, height, color, status } = experiment

  return (
    <div className={`experiment-position experiment-position--${id}`} data-experiment-reveal>
      <button
        type="button"
        className="experiment-object"
        style={{ '--experiment-color': color } as CSSProperties}
        data-selected={selected}
        data-previewed={previewed}
        data-tooltip-dismissed={tooltipDismissed}
        data-experiment-id={id}
        data-cursor="hover"
        aria-label={t('experiments.select', { title })}
        aria-pressed={selected}
        aria-controls="experiment-detail"
        aria-describedby={`experiment-tooltip-${id}`}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return
          setTooltipDismissed(false)
          dispatch({ type: 'hover', id })
        }}
        onPointerLeave={() => dispatch({ type: 'leave', id })}
        onPointerCancel={() => dispatch({ type: 'leave', id })}
        onFocus={(event) => {
          if (!event.currentTarget.matches(':focus-visible')) return
          setTooltipDismissed(false)
          dispatch({ type: 'focus', id })
        }}
        onBlur={() => dispatch({ type: 'blur', id })}
        onClick={() => dispatch({ type: 'select', id })}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setTooltipDismissed(true)
        }}
      >
        <span className="experiment-object-art">
          <img src={asset} width={width} height={height} alt="" draggable={false} />
          <span className={`experiment-idle experiment-idle--${id}`} aria-hidden="true" />
        </span>
        <span className="experiment-name">
          <span className="experiment-dot" />
          <ScrambleText text={title} />
        </span>
        <span className="experiment-status">
          <ScrambleText text={t(`experiments.status.${status}`)} />
        </span>
        <span className="experiment-tooltip" id={`experiment-tooltip-${id}`} role="tooltip">
          <ScrambleText text={title} />
        </span>
      </button>
    </div>
  )
}
