import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Cpu, Printer, Smartphone } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from 'react-i18next'
import ScrambleText from '../ScrambleText'

const explorations = [
  { name: 'Flutter', key: 'flutter', Icon: Smartphone, colorClassName: 'bg-[#bdefff]' },
  { name: 'ESP32', key: 'esp32', Icon: Cpu, colorClassName: 'bg-[#b9edbc]' },
  { name: '3D Printing', key: 'printing', Icon: Printer, colorClassName: 'bg-[#ffc4d8]' },
]

const floatingItemClassName = 'absolute top-3 left-1/2 grid size-[68px] place-items-center rounded-[8px] border-2 border-border p-0 text-[#171717] shadow-[3px_3px_0_var(--border)]'
const iconButtonClassName = 'grid size-9 place-items-center rounded-[4px] border-2 border-border bg-transparent p-0 text-[#171717] hover:bg-white'

export default function CurrentlyExploring() {
  const { t } = useTranslation()
  const [exploring, setExploring] = useState(0)
  const section = useRef<HTMLElement>(null)

  useGSAP(() => {
    const buttons = gsap.utils.toArray<HTMLButtonElement>('[data-exploration-icon]', section.current)
    buttons.forEach((button, index) => {
      const position = (index + explorations.length) % explorations.length
      gsap.set(button, {
        xPercent: -50,
        left: position === 0 ? '50%' : position === 1 ? '88%' : '12%',
        scale: position === 0 ? 1 : 0.55,
        rotation: position === 0 ? -8 : position === 1 ? 8 : -12,
        y: position === 0 ? 0 : 12,
      })
    })
  }, { scope: section })

  useGSAP(() => {
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.35
    const buttons = gsap.utils.toArray<HTMLButtonElement>('[data-exploration-icon]', section.current)
    buttons.forEach((button, index) => {
      const position = (index - exploring + explorations.length) % explorations.length
      gsap.to(button, {
        left: position === 0 ? '50%' : position === 1 ? '88%' : '12%',
        scale: position === 0 ? 1 : 0.55,
        rotation: position === 0 ? -8 : position === 1 ? 8 : -12,
        y: position === 0 ? 0 : 12,
        duration,
        ease: 'power2.inOut',
        overwrite: true,
      })
    })
    gsap.fromTo('[data-exploration-active] > *', { y: 8, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration,
      stagger: duration ? 0.06 : 0,
      ease: 'power2.out',
      overwrite: true,
    })
  }, { scope: section, dependencies: [exploring] })

  return (
    <section ref={section} id="exploring" aria-labelledby="exploring-heading" className="portfolio-panel flex min-w-0 scroll-mt-[140px] flex-col rounded-[8px] border-[3px] border-border bg-[#68a4ff] p-5 text-[#171717] shadow-[7px_7px_0_var(--border)]">
      <h2 id="exploring-heading" className="m-0 text-[12px] leading-[1.5] font-bold"><ScrambleText text={'CURRENTLY EXPLORING'} /></h2>
      <div className="relative my-2 h-20 shrink-0">
        {explorations.map(({ name, key, Icon, colorClassName }, index) => (
          <button key={key} type="button" data-exploration-icon className={`${floatingItemClassName} ${colorClassName}`} aria-label={name} title={name} aria-pressed={exploring === index} onClick={() => setExploring(index)}>
            <Icon size={44} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="grid min-h-[76px]" aria-live="polite" aria-atomic="true">
        {explorations.map(({ name, key }, index) => (
          <div key={key} data-exploration-active={exploring === index ? '' : undefined} aria-hidden={exploring !== index} className={`col-start-1 row-start-1 min-w-0 ${exploring === index ? 'visible' : 'invisible'}`}>
            <h3 className="mt-0 mb-1 text-[25px] leading-[1.2] font-bold">{name}</h3>
            <p className="m-0 text-[14px] leading-[1.45]"><ScrambleText text={t(`home.${key}`)} /></p>
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold"><span className="size-[9px] shrink-0 rounded-full border-[1.5px] border-border bg-[#ffe16b]" /><ScrambleText text={t('home.inProgress')} /></span>
        <div className="flex gap-2">
          <button type="button" className={iconButtonClassName} aria-label={t('home.previous')} title={t('home.previous')} onClick={() => setExploring((exploring + explorations.length - 1) % explorations.length)}><ArrowLeft size={18} aria-hidden="true" /></button>
          <button type="button" className={iconButtonClassName} aria-label={t('home.next')} title={t('home.next')} onClick={() => setExploring((exploring + 1) % explorations.length)}><ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  )
}