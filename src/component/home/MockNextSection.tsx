import { ArrowUp, Code2, FlaskConical, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ScrambleText from '../ScrambleText'

const mockProjects = [
  { id: 'playground', icon: Code2, color: '#a5dff5' },
  { id: 'maker', icon: FlaskConical, color: '#b6db94' },
  { id: 'next', icon: Sparkles, color: '#ff9cba' },
] as const

export default function MockNextSection() {
  const { t } = useTranslation()

  return (
    <section id="after-journey" aria-labelledby="after-journey-heading" className="flex min-h-[120svh] shrink-0 flex-col justify-center gap-12 bg-secondary-background px-5 py-20 text-foreground sm:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <p className="mb-5 inline-block border-2 border-border bg-[#ffe16b] px-3 py-1.5 text-xs font-bold text-[#171717] shadow-[3px_3px_0_var(--border)]"><ScrambleText text={t('afterJourney.label')} /></p>
        <h2 id="after-journey-heading" className="m-0 max-w-[760px] text-[clamp(36px,5vw,64px)] leading-[1.15] font-bold"><ScrambleText text={t('afterJourney.heading')} /><span className="text-[#df563d]">.</span></h2>
        <p className="mt-5 max-w-[650px] text-base leading-relaxed"><ScrambleText text={t('afterJourney.description')} /></p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {mockProjects.map(({ id, icon: Icon, color }, index) => (
            <article key={id} className="flex min-h-[260px] flex-col gap-5 rounded-[8px] border-[3px] border-border p-6 text-[#171717] shadow-[6px_6px_0_var(--border)]" style={{ backgroundColor: color }}>
              <div className="flex items-center justify-between"><Icon size={32} strokeWidth={2.5} aria-hidden="true" /><span className="text-xs font-bold">MOCK / 0{index + 1}</span></div>
              <h3 className="m-0 text-2xl font-bold"><ScrambleText text={t(`afterJourney.projects.${id}.title`)} /></h3>
              <p className="m-0 text-sm leading-relaxed"><ScrambleText text={t(`afterJourney.projects.${id}.description`)} /></p>
              <span className="mt-auto border-t-2 border-[#171717] pt-3 text-xs font-bold"><ScrambleText text={t('afterJourney.placeholder')} /></span>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t-2 border-border pt-6 text-sm">
          <p className="m-0"><ScrambleText text={t('afterJourney.scrollHint')} /></p>
          <a href="#journey" className="inline-flex items-center gap-2 font-bold text-foreground underline underline-offset-4 focus-visible:outline-[3px] focus-visible:outline-foreground focus-visible:outline-offset-4"><ArrowUp size={16} aria-hidden="true" /><ScrambleText text={t('afterJourney.back')} /></a>
        </div>
      </div>
    </section>
  )
}
