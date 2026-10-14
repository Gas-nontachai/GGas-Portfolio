import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import InteractiveProfileCard from './InteractiveProfileCard'
import reactBuddy from '../../assets/life-inventory/react-atom-buddy.png'
import gameController from '../../assets/life-inventory/gaming-game-controller.png'
import printerForge from '../../assets/life-inventory/3d-printer-printer-forge.png'

const satellites = [
  { name: 'react', src: reactBuddy },
  { name: 'gaming', src: gameController },
  { name: 'printing', src: printerForge },
]

const orbitHeightRatio = 0.4
const angularSpeed = 0.00018

export default function ProfileOrbit() {
  const { t } = useTranslation()
  const stage = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const element = stage.current
    if (!element) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('.profile-orbit__item'))
    gsap.set(buttons, { xPercent: -50, yPercent: -50 })
    gsap.set(buttons.map((button) => button.querySelector('[data-orbit-depth]')), { scale: 1, opacity: 1 })
    const models = buttons.map((button, index) => ({
      button,
      depthWrapper: button.querySelector<HTMLSpanElement>('[data-orbit-depth]')!,
      image: button.querySelector('img')!,
      phase: index * Math.PI * 2 / buttons.length - Math.PI / 2,
      recovering: false,
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      setX: gsap.quickSetter(button, 'x', 'px'),
      setY: gsap.quickSetter(button, 'y', 'px'),
      setScaleX: gsap.quickSetter(button.querySelector('[data-orbit-depth]'), 'scaleX'),
      setScaleY: gsap.quickSetter(button.querySelector('[data-orbit-depth]'), 'scaleY'),
      setOpacity: gsap.quickSetter(button.querySelector('[data-orbit-depth]'), 'opacity'),
    }))
    let width = element.clientWidth
    let height = element.clientHeight
    let hovered: number | null = null
    let focused: number | null = null
    let drag: { index: number; pointerId: number; startX: number; startY: number; originX: number; originY: number; x: number; y: number } | null = null

    const emphasize = () => {
      const active = drag?.index ?? hovered ?? focused
      models.forEach((model, index) => {
        gsap.to(model.image, {
          scale: active === index ? 1.22 : 1,
          filter: `brightness(${active === null || active === index ? 1 : 0.55})`,
          duration: motionQuery.matches ? 0 : 0.22,
          overwrite: true,
        })
      })
    }

    const render = (_time: number, deltaTime: number) => {
      models.forEach((model, index) => {
        if (!motionQuery.matches) model.phase += angularSpeed * Math.min(deltaTime, 64)
        const size = model.button.offsetWidth
        const sine = Math.sin(model.phase)
        const depth = (sine + 1) / 2
        const depthScale = 0.8 + depth * 0.4
        model.x = Math.cos(model.phase) * (width - size * 1.4) / 2
        model.y = sine * ((height - size * 1.4) / 2) * orbitHeightRatio
        const dragging = drag?.index === index ? drag : null
        const positionX = dragging ? dragging.x : model.x + model.offsetX
        const positionY = dragging ? dragging.y : model.y + model.offsetY
        model.setX(positionX)
        model.setY(positionY)
        model.setScaleX(depthScale)
        model.setScaleY(depthScale)
        model.setOpacity(0.65 + depth * 0.35)
        model.button.style.zIndex = dragging || depth >= 0.5 ? '2' : '0'
      })
    }

    const observer = new ResizeObserver(() => {
      width = element.clientWidth
      height = element.clientHeight
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
        hovered = null
        focused = null
        drag = {
          index,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: model.x + model.offsetX,
          originY: model.y + model.offsetY,
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
        const limitX = (width - model.button.offsetWidth * 1.4) / 2
        const limitY = (height - model.button.offsetHeight * 1.4) / 2
        drag.x = gsap.utils.clamp(-limitX, limitX, drag.originX + event.clientX - drag.startX)
        drag.y = gsap.utils.clamp(-limitY, limitY, drag.originY + event.clientY - drag.startY)
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
        delete model.button.dataset.dragging
        if (model.button.hasPointerCapture(pointerId)) model.button.releasePointerCapture(pointerId)
        gsap.to(model, {
          offsetX: 0,
          offsetY: 0,
          duration: motionQuery.matches ? 0 : 1.2,
          ease: 'power2.inOut',
          overwrite: true,
          onComplete: () => { model.recovering = false },
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
        if (drag?.index === index) {
          const pointerId = drag.pointerId
          drag = null
          delete model.button.dataset.dragging
          if (model.button.hasPointerCapture(pointerId)) model.button.releasePointerCapture(pointerId)
        }
        gsap.killTweensOf(model)
        gsap.killTweensOf(model.image)
        gsap.killTweensOf(model.depthWrapper)
      }
    })

    return () => {
      gsap.ticker.remove(render)
      observer.disconnect()
      cleanups.forEach((cleanup) => cleanup())
    }
  }, { scope: stage })

  return (
    <div ref={stage} className="profile-orbit relative isolate mx-auto box-border w-full max-w-[470px] overflow-clip px-[clamp(52px,18%,84px)] py-[54px]">
      <div data-profile-card className="relative z-[1]"><InteractiveProfileCard /></div>
      {satellites.map(({ name, src }) => (
        <button
          key={name}
          type="button"
          className="profile-orbit__item absolute top-1/2 left-1/2 aspect-square w-[clamp(40px,12%,64px)] touch-none border-0 bg-transparent p-0 select-none will-change-transform [-webkit-user-select:none] [-webkit-tap-highlight-color:transparent] focus-visible:rounded-lg focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-foreground"
          aria-label={t(`profile.${name}`)}
          title={t(`profile.${name}`)}
        >
          <span data-orbit-depth className="pointer-events-none relative block h-full w-full origin-center will-change-[transform,opacity]">
            <img className="pointer-events-none absolute -top-1/2 -left-1/2 block h-[200%] w-[200%] max-w-none origin-center object-contain brightness-100" src={src} alt="" draggable={false} />
          </span>
        </button>
      ))}
    </div>
  )
}