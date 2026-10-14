import { Fragment, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import InteractiveProfileCard from './InteractiveProfileCard'
import reactBuddy from '../../assets/life-inventory/react-atom-buddy.png'
import gameController from '../../assets/life-inventory/gaming-game-controller.png'
import printerForge from '../../assets/life-inventory/3d-printer-printer-forge.png'
import flutterShard from '../../assets/life-inventory/flutter-flutter-shard.png'
import webcamEye from '../../assets/life-inventory/webcam-camera-eye.png'
import runningSpeedShoes from '../../assets/life-inventory/running-speed-shoes.png'

const satellites = [
  { name: 'react', src: reactBuddy },
  { name: 'gaming', src: gameController },
  { name: 'printing', src: printerForge },
  { name: 'flutter', src: flutterShard },
  { name: 'webcam', src: webcamEye },
  { name: 'running', src: runningSpeedShoes },
]

const orbitHeightRatio = 0.4
const angularSpeed = 0.00018
const layerTransitionRange = 0.18

function smoothstep(value: number) {
  const progress = gsap.utils.clamp(0, 1, value)
  return progress * progress * (3 - 2 * progress)
}

export default function ProfileOrbit() {
  const { t } = useTranslation()
  const stage = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const element = stage.current
    if (!element) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('.profile-orbit__item'))
    const backLayers = Array.from(element.querySelectorAll<HTMLSpanElement>('[data-orbit-back]'))
    gsap.set([...buttons, ...backLayers], { xPercent: -50, yPercent: -50 })
    gsap.set(element.querySelectorAll('[data-orbit-depth]'), { scale: 1, opacity: 1 })
    const models = buttons.map((button, index) => {
      const backLayer = backLayers[index]
      const depthWrappers = [button.querySelector<HTMLSpanElement>('[data-orbit-depth]')!, backLayer.querySelector<HTMLSpanElement>('[data-orbit-depth]')!]
      return {
        button,
        backLayer,
        depthWrappers,
        images: [button.querySelector('img')!, backLayer.querySelector('img')!],
        phase: index * Math.PI * 2 / buttons.length - Math.PI / 2,
        recovering: false,
        layerLift: 0,
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
        setX: gsap.quickSetter([button, backLayer], 'x', 'px'),
        setY: gsap.quickSetter([button, backLayer], 'y', 'px'),
        setScaleX: gsap.quickSetter(depthWrappers, 'scaleX'),
        setScaleY: gsap.quickSetter(depthWrappers, 'scaleY'),
        setFrontOpacity: gsap.quickSetter(depthWrappers[0], 'opacity'),
        setBackOpacity: gsap.quickSetter(depthWrappers[1], 'opacity'),
      }
    })
    let width = element.clientWidth
    let height = element.clientHeight
    let viewportRadius = 0
    let hovered: number | null = null
    let focused: number | null = null
    let drag: { index: number; pointerId: number; grabX: number; grabY: number; x: number; y: number } | null = null

    const emphasize = () => {
      const active = drag?.index ?? hovered ?? focused
      models.forEach((model, index) => {
        gsap.to(model.images, {
          scale: active === index ? 1.22 : 1,
          filter: `brightness(${active === null || active === index ? 1 : 0.55})`,
          duration: motionQuery.matches ? 0 : 0.22,
          overwrite: true,
        })
      })
    }

    const horizontalRadius = (size: number) => Math.max(0, Math.min(width / 2, viewportRadius - size * 1.5 - 6))

    const render = (_time: number, deltaTime: number) => {
      models.forEach((model, index) => {
        if (!motionQuery.matches) model.phase += angularSpeed * Math.min(deltaTime, 64)
        const size = model.button.offsetWidth
        const sine = Math.sin(model.phase)
        const depth = (sine + 1) / 2
        const easedDepth = smoothstep(depth)
        const depthScale = 0.8 + easedDepth * 0.4
        const orbitFrontWeight = smoothstep((sine + layerTransitionRange) / (2 * layerTransitionRange))
        const layerLift = focused === index ? 1 : model.layerLift
        const frontWeight = orbitFrontWeight + (1 - orbitFrontWeight) * layerLift
        const opacity = 0.65 + easedDepth * 0.35
        model.x = Math.cos(model.phase) * horizontalRadius(size)
        model.y = sine * ((height - size * 1.4) / 2) * orbitHeightRatio
        const dragging = drag?.index === index ? drag : null
        const positionX = dragging ? dragging.x : model.x + model.offsetX
        const positionY = dragging ? dragging.y : model.y + model.offsetY
        model.setX(positionX)
        model.setY(positionY)
        model.setScaleX(depthScale)
        model.setScaleY(depthScale)
        model.setFrontOpacity(opacity * frontWeight)
        model.setBackOpacity(opacity * (1 - frontWeight))
        model.button.style.pointerEvents = frontWeight > 0.05 || dragging ? 'auto' : 'none'
      })
    }

    const observer = new ResizeObserver(() => {
      width = element.clientWidth
      height = element.clientHeight
      const centerX = element.getBoundingClientRect().left + width / 2
      viewportRadius = Math.min(centerX, document.documentElement.clientWidth - centerX)
      render(0, 0)
    })
    observer.observe(element)
    render(0, 0)
    gsap.ticker.add(render)

    const cleanups = models.map((model, index) => {
      const enter = (event: PointerEvent) => {
        if (event.pointerType === 'touch' || drag || model.recovering) return
        hovered = index
        emphasize()
      }
      const leave = () => {
        if (hovered === index) hovered = null
        emphasize()
      }
      const focus = () => {
        if (model.button.matches(':focus-visible')) focused = index
        emphasize()
      }
      const blur = () => {
        if (focused === index) focused = null
        emphasize()
      }
      const down = (event: PointerEvent) => {
        if (drag || event.button !== 0) return
        event.preventDefault()
        gsap.killTweensOf(model)
        model.recovering = false
        delete model.button.dataset.recovering
        model.layerLift = 1
        hovered = null
        focused = null
        const bounds = element.getBoundingClientRect()
        drag = {
          index,
          pointerId: event.pointerId,
          grabX: event.clientX - (bounds.left + width / 2 + model.x + model.offsetX),
          grabY: event.clientY - (bounds.top + height / 2 + model.y + model.offsetY),
          x: model.x + model.offsetX,
          y: model.y + model.offsetY,
        }
        model.button.setPointerCapture(event.pointerId)
        model.button.dataset.dragging = 'true'
        emphasize()
        render(0, 0)
      }
      const move = (event: PointerEvent) => {
        if (!drag) {
          if (hovered !== index) enter(event)
          return
        }
        if (!drag || drag.index !== index || drag.pointerId !== event.pointerId) return
        const bounds = element.getBoundingClientRect()
        const centerX = bounds.left + width / 2
        const centerY = bounds.top + height / 2
        const viewportWidth = document.documentElement.clientWidth
        const viewportHeight = document.documentElement.clientHeight
        const insetX = Math.min(model.button.offsetWidth * 1.5 + 6, viewportWidth / 2)
        const insetY = Math.min(model.button.offsetHeight * 1.5 + 6, viewportHeight / 2)
        drag.x = gsap.utils.clamp(insetX - centerX, viewportWidth - insetX - centerX, event.clientX - drag.grabX - centerX)
        drag.y = gsap.utils.clamp(insetY - centerY, viewportHeight - insetY - centerY, event.clientY - drag.grabY - centerY)
        render(0, 0)
      }
      const finishDrag = (pointerId: number) => {
        if (!drag || drag.index !== index || drag.pointerId !== pointerId) return
        model.offsetX = drag.x - model.x
        model.offsetY = drag.y - model.y
        drag = null
        hovered = null
        focused = null
        model.recovering = true
        model.button.dataset.recovering = 'true'
        delete model.button.dataset.dragging
        if (model.button.hasPointerCapture(pointerId)) model.button.releasePointerCapture(pointerId)
        gsap.to(model, {
          offsetX: 0,
          offsetY: 0,
          layerLift: 0,
          duration: motionQuery.matches ? 0 : 1.2,
          ease: 'power2.inOut',
          overwrite: true,
          onComplete: () => {
            model.recovering = false
            delete model.button.dataset.recovering
          },
        })
        emphasize()
        render(0, 0)
      }
      const release = (event: PointerEvent) => finishDrag(event.pointerId)
      const windowBlur = () => {
        if (drag?.index === index) finishDrag(drag.pointerId)
      }
      model.button.addEventListener('pointerenter', enter)
      model.button.addEventListener('pointerleave', leave)
      model.button.addEventListener('focus', focus)
      model.button.addEventListener('blur', blur)
      model.button.addEventListener('pointerdown', down)
      model.button.addEventListener('pointermove', move)
      model.button.addEventListener('pointerup', release)
      model.button.addEventListener('pointercancel', release)
      model.button.addEventListener('lostpointercapture', release)
      window.addEventListener('blur', windowBlur)
      return () => {
        model.button.removeEventListener('pointerenter', enter)
        model.button.removeEventListener('pointerleave', leave)
        model.button.removeEventListener('focus', focus)
        model.button.removeEventListener('blur', blur)
        model.button.removeEventListener('pointerdown', down)
        model.button.removeEventListener('pointermove', move)
        model.button.removeEventListener('pointerup', release)
        model.button.removeEventListener('pointercancel', release)
        model.button.removeEventListener('lostpointercapture', release)
        window.removeEventListener('blur', windowBlur)
        delete model.button.dataset.recovering
        if (drag?.index === index) {
          const pointerId = drag.pointerId
          drag = null
          delete model.button.dataset.dragging
          if (model.button.hasPointerCapture(pointerId)) model.button.releasePointerCapture(pointerId)
        }
        gsap.killTweensOf(model)
        gsap.killTweensOf(model.images)
        gsap.killTweensOf(model.depthWrappers)
      }
    })

    return () => {
      gsap.ticker.remove(render)
      observer.disconnect()
      cleanups.forEach((cleanup) => cleanup())
    }
  }, { scope: stage })

  return (
    <div ref={stage} className="profile-orbit relative isolate mx-auto box-border w-full max-w-[470px] overflow-visible">
      <div data-profile-card className="relative z-[1]"><InteractiveProfileCard /></div>
      {satellites.map(({ name, src }) => (
        <Fragment key={name}>
          <span data-orbit-back aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-square w-[clamp(40px,12%,64px)] select-none will-change-transform">
            <span data-orbit-depth className="relative block h-full w-full origin-center will-change-[transform,opacity]">
              <img className="absolute -top-1/2 -left-1/2 block h-[200%] w-[200%] max-w-none origin-center object-contain brightness-100" src={src} alt="" draggable={false} />
            </span>
          </span>
          <button
            type="button"
            className="profile-orbit__item absolute top-1/2 left-1/2 z-[2] aspect-square w-[clamp(40px,12%,64px)] touch-none border-0 bg-transparent p-0 select-none will-change-transform [-webkit-user-select:none] [-webkit-tap-highlight-color:transparent] focus-visible:rounded-lg focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-foreground"
            aria-label={t(`profile.${name}`)}
            title={t(`profile.${name}`)}
          >
            <span data-orbit-depth className="pointer-events-none relative block h-full w-full origin-center will-change-[transform,opacity]">
              <img className="pointer-events-none absolute -top-1/2 -left-1/2 block h-[200%] w-[200%] max-w-none origin-center object-contain brightness-100" src={src} alt="" draggable={false} />
            </span>
          </button>
        </Fragment>
      ))}
    </div>
  )
}