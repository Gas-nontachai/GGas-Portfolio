import { useCallback, useState, type CSSProperties, type HTMLAttributes } from 'react'
import ScrambleText from '../../ScrambleText'
import PolaroidZoom from './PolaroidZoom'
import blueTape from '../../../assets/journey-notebook-asset-pack/svg/07-paper-tape-blue.svg'
import './photo-frame.css'

export default function PhotoFrame({
  src,
  alt,
  caption,
  scrambleCaption = true,
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
  scrambleCaption?: boolean
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
          <figcaption>{scrambleCaption ? <ScrambleText text={caption} /> : caption}</figcaption>
        )}
      </figure>
      {zoomSource && <PolaroidZoom source={zoomSource} onExited={closeZoom} />}
    </>
  )
}
