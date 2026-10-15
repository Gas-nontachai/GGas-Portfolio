import { useId } from 'react'
import type { Experiment } from './experiments.config'

/** Artwork coordinates keep activity aligned as the scene and its objects scale. */
export default function ExperimentActivity({ experiment }: { experiment: Experiment }) {
  const printClip = useId()
  if (experiment.id === 'flutter') {
    return <span className="experiment-idle experiment-idle--flutter" aria-hidden="true" />
  }

  return (
    <svg
      className="experiment-idle experiment-activity"
      viewBox={`0 0 ${experiment.width} ${experiment.height}`}
      aria-hidden="true"
      focusable="false"
    >
      {experiment.id === 'esp32' && (
        <circle className="experiment-activity-led" cx="307" cy="285" r="8" fill="#a6ff45" />
      )}
      {experiment.id === 'printing' && (
        <>
          <defs>
            <clipPath id={printClip}>
              <path d="M280 375 L308 365 L380 365 L356 375 Z" />
            </clipPath>
          </defs>
          <path
            className="experiment-activity-filament"
            d="M334 349 V365"
            stroke="#ff80ab"
            strokeWidth="4"
            strokeDasharray="4 4"
          />
          <g clipPath={`url(#${printClip})`}>
            <rect
              className="experiment-activity-print-pass"
              x="280"
              y="364"
              width="14"
              height="14"
              fill="#ff80ab"
            />
          </g>
        </>
      )}
      {experiment.id === 'davinci' && (
        <>
          {/* Replace the baked-in playhead so only one cursor moves on the timeline. */}
          <path fill="#171717" d="M150 240 H694 V339 H150 Z" />
          <g stroke="#171717" strokeWidth="5">
            <rect x="159" y="260" width="304" height="30" rx="7" fill="#ff80ab" />
            <rect x="498" y="260" width="186" height="30" rx="7" fill="#ff80ab" />
            <rect x="211" y="297" width="473" height="30" rx="7" fill="#68a4ff" />
          </g>
          <g
            className="experiment-activity-playhead"
            fill="#ff80ab"
            stroke="#171717"
            strokeWidth="3"
          >
            <path d="M162 252 V335" stroke="#ff80ab" strokeWidth="5" />
            <circle cx="162" cy="252" r="9" />
          </g>
        </>
      )}
    </svg>
  )
}
