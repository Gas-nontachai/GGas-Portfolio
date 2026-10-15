import { ArrowDownRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { profileConfig } from '../../config/profile'
import ScrambleText from '../ScrambleText'
import { handleScrollNavigation } from '../../utils/scrollNavigation'

const ctaClassName = 'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[6px] border-2 border-border px-4 py-2.5 text-[14px] font-bold text-[#171717] no-underline shadow-[4px_4px_0_var(--border)] transition-[translate,box-shadow] duration-150 ease-[ease] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--border)]'

export default function Introduction() {
  const { t } = useTranslation()

  return (
    <section id="introduction" aria-labelledby="intro-heading" className="portfolio-panel row-span-2 flex min-w-0 scroll-mt-[140px] flex-col gap-5 rounded-[8px] border-[3px] border-border bg-secondary-background p-7 shadow-[7px_7px_0_var(--border)] max-[1150px]:row-auto max-[700px]:p-6">
      <p className="intro-reveal m-0 flex items-center gap-[9px] text-[12px] leading-[1.5] font-bold"><span className="size-[9px] shrink-0 rounded-full border-[1.5px] border-border bg-[#a9d89a]" /><ScrambleText text={'OPEN TO NEW IDEAS'} /></p>
      <div className="my-auto">
        <p className="intro-reveal mt-0 mb-0.5 text-[24px] font-bold"><ScrambleText text={t('home.hello')} /></p>
        <h1 id="intro-heading" className="intro-reveal m-0 text-[76px] leading-[1.05] font-bold max-[700px]:text-[64px]">{profileConfig.name}<span className="text-[#df563d]">.</span></h1>
        <h2 className="intro-reveal mt-3.5 mb-5 text-[32px] leading-[1.15] font-bold text-balance max-[700px]:text-[28px]"><ScrambleText text={t('home.tagline')} /></h2>
        <p className="intro-reveal m-0 text-[18px] leading-[1.65] max-[700px]:text-[17px]"><ScrambleText text={t('home.description')} /></p>
      </div>
      <div className="intro-reveal flex flex-wrap gap-3.5">
        <a className={`${ctaClassName} bg-[#ff80ab]`} href="#journey" onClick={handleScrollNavigation}><ScrambleText text={t('home.explore')} /><ArrowDownRight size={20} className="shrink-0" aria-hidden="true" /></a>
      </div>
      <div className="intro-reveal flex items-center justify-between gap-3 border-t-2 border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] pt-3 text-[10px] font-bold"><span>CODE / CREATE / REPEAT</span><Sparkles size={19} aria-hidden="true" /></div>
    </section>
  )
}