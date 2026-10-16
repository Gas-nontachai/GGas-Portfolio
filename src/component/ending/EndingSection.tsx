import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import DrivingScene from './DrivingScene'
import EndingMessage from './EndingMessage'
import { endingConfig, roadsideObjects } from './ending.config'
import {
  getDrivingFrame,
  getEndingLayout,
  getLoopDepth,
  projectGround,
  smoothstep,
} from './drivingMath'
import './ending.css'

gsap.registerPlugin(ScrollTrigger)

export default function EndingSection({ ready = true }: { ready?: boolean }) {
  const { t } = useTranslation()
  const section = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (!ready || !section.current) return
      const root = section.current
      const query = <T extends Element>(selector: string) => root.querySelector<T>(selector)!
      const blocks = query<HTMLDivElement>('[data-ending-roadblocks]')
      const cockpit = query<HTMLDivElement>('[data-ending-cockpit]')
      const steering = query<HTMLImageElement>('[data-ending-steering]')
      const clouds = query<HTMLDivElement>('[data-ending-clouds]')
      const hills = query<SVGElement>('[data-ending-hills]')
      const message = query<HTMLDivElement>('[data-ending-message]')
      const hint = query<HTMLParagraphElement>('[data-ending-hint]')
      const road = query<SVGSVGElement>('.ending-road')
      const scenery = [...root.querySelectorAll<HTMLElement>('[data-roadside]')]
      const marks = [...root.querySelectorAll<SVGPathElement>('[data-lane-mark]')]
      const media = gsap.matchMedia()
      media.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          animated: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const reduced = Boolean(context.conditions?.reduced)
          const position = { progress: reduced ? 1 : 0 }
          let layout = getEndingLayout(root.clientWidth, root.clientHeight)
          let interactive = false
          const render = () => {
            const frame = getDrivingFrame(reduced ? 1 : position.progress)
            const block = projectGround(frame.distance, layout)
            blocks.style.transform = `translate(${block.x}px, ${block.y}px) scale(${block.scale}) translate(-50%, -100%)`
            cockpit.style.transform = `translateY(${(1 - frame.entrance) * layout.height * 0.28 + frame.pitch * layout.motion}px)`
            steering.style.rotate = `${reduced ? 0 : Math.sin(frame.travel / 45) * frame.speed * 1.2 * layout.motion}deg`
            clouds.style.transform = `translateX(${-frame.fraction * layout.width * 0.035 * layout.motion}px)`
            hills.style.transform = `translateX(${-frame.fraction * layout.width * 0.012 * layout.motion}px)`
            scenery.forEach((node, index) => {
              const object = roadsideObjects[index]
              const depth = getLoopDepth(object.depth, frame.travel)
              const projection = projectGround(depth, layout, object.side * object.lateral)
              node.style.transform = `translate(${projection.x}px, ${projection.y}px) scale(${projection.scale}) translate(-50%, -100%)`
              node.style.opacity = String(smoothstep((depth - 4) / 12))
              node.style.zIndex = String(5 + Math.round(300 - depth))
            })
            marks.forEach((mark, index) => {
              const depth = getLoopDepth(index * 25, frame.travel)
              const near = projectGround(depth, layout)
              const far = projectGround(depth + 9, layout)
              const halfNear = layout.width * 0.008 * near.scale
              const halfFar = layout.width * 0.008 * far.scale
              mark.setAttribute(
                'd',
                `M${far.x - halfFar},${far.y} L${far.x + halfFar},${far.y} L${near.x + halfNear},${near.y} L${near.x - halfNear},${near.y}Z`,
              )
              mark.style.opacity = String(smoothstep((depth - 4) / 12))
            })
            message.style.opacity = String(frame.messageOpacity)
            message.style.transform = `translateY(${(1 - frame.messageOpacity) * 14}px)`
            const nextInteractive = frame.messageOpacity > 0.05
            if (nextInteractive !== interactive || reduced) {
              interactive = nextInteractive
              message.inert = !interactive
              message.setAttribute('aria-hidden', String(!interactive))
              message.style.visibility = interactive ? 'visible' : 'hidden'
            }
            hint.style.opacity = String(reduced ? 0 : 1 - smoothstep(frame.progress / 0.15))
            root.dataset.stopped = String(frame.progress >= endingConfig.stop)
          }
          const measure = () => {
            layout = getEndingLayout(root.clientWidth, root.clientHeight)
            const { width: w, height: h, center: c, horizon } = layout
            road.setAttribute('viewBox', `0 0 ${w} ${h}`)
            query<SVGPathElement>('[data-road-shoulder]').setAttribute(
              'd',
              `M${c - 5},${horizon} L${c + 5},${horizon} L${c + w * 1.12},${h} L${c - w * 1.12},${h}Z`,
            )
            query<SVGPathElement>('[data-road-surface]').setAttribute(
              'd',
              `M${c - 2},${horizon} L${c + 2},${horizon} L${c + w * 0.96},${h} L${c - w * 0.96},${h}Z`,
            )
            query<SVGPathElement>('[data-road-edge]').setAttribute(
              'd',
              `M${c - 3},${horizon} L${c - w * 0.89},${h} M${c + 3},${horizon} L${c + w * 0.89},${h}`,
            )
            blocks.style.width = `${layout.blockWidth}px`
            scenery.forEach((node) => {
              node.style.width = `${layout.sceneryWidth}px`
            })
            render()
          }
          // Compose the static first/last frame before connecting scroll updates.
          measure()
          const tween = reduced
            ? null
            : gsap.to(position, {
                progress: 1,
                ease: 'none',
                onUpdate: render,
                scrollTrigger: {
                  id: 'portfolio-ending',
                  trigger: root,
                  start: 'top top',
                  end: () =>
                    `+=${root.clientHeight * (layout.compact ? endingConfig.compactScrollScreens : endingConfig.desktopScrollScreens)}`,
                  pin: true,
                  pinSpacing: true,
                  scrub: 1,
                  invalidateOnRefresh: true,
                  onRefreshInit: measure,
                  onRefresh: render,
                },
              })
          root.dataset.reduced = String(reduced)
          const observer = new ResizeObserver(() => {
            measure()
            if (tween) ScrollTrigger.refresh()
          })
          observer.observe(root)
          let disposed = false
          void document.fonts.ready.then(() => {
            if (!disposed) ScrollTrigger.refresh()
          })
          return () => {
            disposed = true
            observer.disconnect()
          }
        },
      )
      return () => media.revert()
    },
    { scope: section, dependencies: [ready], revertOnUpdate: true },
  )

  return (
    <section
      id="road-ahead"
      ref={section}
      className="ending-section"
      aria-labelledby="ending-heading"
    >
      <DrivingScene />
      <EndingMessage />
      <p className="ending-scroll-hint" data-ending-hint>
        {t('ending.scroll')} <span aria-hidden="true">↓</span>
      </p>
    </section>
  )
}
