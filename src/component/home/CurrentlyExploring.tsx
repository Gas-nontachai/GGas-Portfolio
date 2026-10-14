import { useState } from 'react'
import { ArrowLeft, ArrowRight, Code2, Cpu, Printer, Smartphone, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const explorations = [
  { name: 'Flutter', key: 'flutter', Icon: Smartphone, colorClassName: 'bg-[#bdefff]' },
  { name: 'ESP32', key: 'esp32', Icon: Cpu, colorClassName: 'bg-[#b9edbc]' },
  { name: '3D Printing', key: 'printing', Icon: Printer, colorClassName: 'bg-[#ffc4d8]' },
]

const floatingItemClassName = 'absolute grid animate-inventory-float place-items-center rounded-[8px] border-2 border-[#171717] shadow-[3px_3px_0_#171717] motion-reduce:animate-none'
const iconButtonClassName = 'grid size-9 place-items-center rounded-[4px] border-2 border-[#171717] bg-transparent p-0 text-[#171717] hover:bg-white'

export default function CurrentlyExploring() {
  const { t } = useTranslation()
  const [exploring, setExploring] = useState(0)
  const exploration = explorations[exploring]

  return (
    <section id="exploring" aria-labelledby="exploring-heading" className="portfolio-panel flex min-w-0 scroll-mt-[140px] flex-col rounded-[8px] border-[3px] border-[#171717] bg-[#68a4ff] p-5 text-[#171717] shadow-[7px_7px_0_#171717]">
      <div className="flex items-center justify-between gap-3"><h2 id="exploring-heading" className="m-0 text-[12px] leading-[1.5] font-bold">{t('home.exploring')}</h2><Sparkles size={20} aria-hidden="true" /></div>
      <div className="relative my-2 h-20 shrink-0" key={exploration.key} aria-hidden="true">
        <span className={`${floatingItemClassName} top-3 left-[calc(50%-34px)] size-[68px] -rotate-[8deg] ${exploration.colorClassName}`}><exploration.Icon size={44} strokeWidth={1.8} /></span>
        <span className={`${floatingItemClassName} top-[30px] left-[8%] size-[35px] rotate-[12deg] bg-white [animation-delay:-.9s]`}><Code2 size={21} /></span>
        <span className={`${floatingItemClassName} top-[7px] right-[6%] size-[37px] rotate-[8deg] bg-[#ffe16b] [animation-delay:-1.8s]`}><Sparkles size={23} /></span>
      </div>
      <div className="min-h-[76px]" aria-live="polite" aria-atomic="true"><h3 className="mt-0 mb-1 text-[25px] leading-[1.2] font-bold">{exploration.name}</h3><p className="m-0 text-[14px] leading-[1.45]">{t(`home.${exploration.key}`)}</p></div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold"><span className="size-[9px] shrink-0 rounded-full border-[1.5px] border-[#171717] bg-[#ffe16b]" />{t('home.inProgress')}</span>
        <div className="flex gap-2">
          <button type="button" className={iconButtonClassName} aria-label={t('home.previous')} title={t('home.previous')} onClick={() => setExploring((exploring + explorations.length - 1) % explorations.length)}><ArrowLeft size={18} aria-hidden="true" /></button>
          <button type="button" className={iconButtonClassName} aria-label={t('home.next')} title={t('home.next')} onClick={() => setExploring((exploring + 1) % explorations.length)}><ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  )
}