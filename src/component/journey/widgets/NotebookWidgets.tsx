import {
  useCallback,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import ScrambleText from '../../ScrambleText'
import PolaroidZoom from './PolaroidZoom'
import blueTape from '../../../assets/journey-notebook-asset-pack/svg/07-paper-tape-blue.svg'
import star from '../../../assets/journey-notebook-asset-pack/svg/12-sticker-star.svg'
import heart from '../../../assets/journey-notebook-asset-pack/svg/13-sticker-heart.svg'
import arrow from '../../../assets/journey-notebook-asset-pack/svg/14-sticker-arrow.svg'
import bookmark from '../../../assets/journey-notebook-asset-pack/svg/09-bookmark-tab.svg'
import paperclip from '../../../assets/journey-notebook-asset-pack/svg/18-paperclip.svg'
import car from '../../../assets/journey_timeline/journey_car_side.png'

type BlockProps = HTMLAttributes<HTMLDivElement>

export function EpisodeLabel({
  text,
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { text: string }) {
  return (
    <p {...props} className={`notebook-eyebrow ${className}`}>
      <ScrambleText text={text} />
    </p>
  )
}

export function PhotoFrame({
  src,
  alt,
  caption,
  personal = false,
  variant = 'illustrated',
  tape = blueTape,
  rotation = -3,
  imageStyle,
  className = '',
  style,
  onClick,
  onKeyDown,
  ...props
}: HTMLAttributes<HTMLElement> & {
  src: string
  alt: string
  caption?: string
  personal?: boolean
  variant?: 'illustrated' | 'polaroid'
  tape?: string | false
  rotation?: number
  imageStyle?: CSSProperties
}) {
  const [zoomSource, setZoomSource] = useState<HTMLElement | null>(null)
  const closeZoom = useCallback(() => setZoomSource(null), [])
  const interactive = variant === 'polaroid'

  return (
    <>
      <figure
        {...props}
        className={`notebook-photo${personal ? ' notebook-photo-personal' : ''}${variant === 'polaroid' ? ' notebook-photo-polaroid' : ''} ${className}`}
        style={{ transform: `rotate(${rotation}deg)`, ...style }}
        role={interactive ? 'button' : props.role}
        tabIndex={interactive ? 0 : props.tabIndex}
        aria-haspopup={interactive ? 'dialog' : undefined}
        aria-expanded={interactive ? Boolean(zoomSource) : undefined}
        aria-label={interactive ? alt : props['aria-label']}
        onClick={(event) => {
          onClick?.(event)
          if (interactive && !event.defaultPrevented && !zoomSource)
            setZoomSource(event.currentTarget)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (
            interactive &&
            !event.defaultPrevented &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault()
            if (!zoomSource) setZoomSource(event.currentTarget)
          }
        }}
      >
        {tape && <img src={tape} className="notebook-tape" alt="" aria-hidden="true" />}
        <img src={src} alt={alt} style={imageStyle} />
        {caption && (
          <figcaption>
            <ScrambleText text={caption} />
          </figcaption>
        )}
      </figure>
      {zoomSource && <PolaroidZoom source={zoomSource} onExited={closeZoom} />}
    </>
  )
}

export function Highlights({
  title,
  items,
  className = '',
  ...props
}: BlockProps & { title?: string; items: string[] }) {
  return (
    <div {...props} className={className}>
      {title && (
        <h3>
          <ScrambleText text={title} />
        </h3>
      )}
      <ul className="notebook-memories">
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <ScrambleText text={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MemoryNote({
  title,
  children,
  icon = star,
  className = '',
  ...props
}: BlockProps & { title: string; children: ReactNode; icon?: string }) {
  return (
    <div {...props} className={`notebook-memory-note ${className}`}>
      <img src={icon} alt="" aria-hidden="true" />
      <div>
        <h3>
          <ScrambleText text={title} />
        </h3>
        {children}
      </div>
    </div>
  )
}

export function Takeaway({
  label,
  children,
  className = '',
  ...props
}: BlockProps & { label: string; children: ReactNode }) {
  return (
    <div {...props} className={`notebook-takeaway ${className}`}>
      <img src={arrow} alt="" aria-hidden="true" />
      <p>
        <strong>
          <ScrambleText text={label} />
        </strong>
        <br />
        {children}
      </p>
    </div>
  )
}

const stickers = { star, heart, arrow, bookmark, paperclip, car }

export function Sticker({
  kind,
  ...props
}: HTMLAttributes<HTMLImageElement> & { kind: keyof typeof stickers }) {
  return <img {...props} src={stickers[kind]} alt="" aria-hidden="true" />
}

export function Tags({
  text,
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { text: string }) {
  return (
    <p {...props} className={`notebook-tags ${className}`}>
      <ScrambleText text={text} />
    </p>
  )
}
