import { useId, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Code2, Crown, Sparkles, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import cartoonPortrait from '../../assets/profile/avatar.png'
import realPortrait from '../../assets/profile/nontachai.jpg'
import { profileConfig } from '../../config/profile'
import ScrambleText from '../ScrambleText'

gsap.registerPlugin(useGSAP)

type InteractiveProfileCardProps = {
  name?: string
  role?: string
  cartoonSrc?: string
  photoSrc?: string
}

function Portrait({ src, name, cartoon }: { src: string; name: string; cartoon: boolean }) {
  const { t } = useTranslation()
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  return (
    <span className="block h-full w-full overflow-hidden rounded-full border-4 border-border bg-[#fff6dc] shadow-[4px_5px_0_var(--border)]">
      {failedSrc === src ? (
        <span
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[#b2e0f5] text-lg font-bold"
          role="img"
          aria-label={t(cartoon ? 'profile.cartoonUnavailable' : 'profile.photoUnavailable', { name })}
        >
          <UserRound className="size-[48%] stroke-[1.5]" aria-hidden="true" />
          <span>{name}</span>
        </span>
      ) : (
        <img
          className={`h-full w-full object-[center_38%] ${cartoon ? 'object-contain' : 'object-cover'}`}
          src={src}
          alt={t(cartoon ? 'profile.cartoon' : 'profile.photo', { name })}
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  )
}

export default function InteractiveProfileCard({
  name = profileConfig.name,
  role,
  cartoonSrc = cartoonPortrait,
  photoSrc = realPortrait,
}: InteractiveProfileCardProps) {
  const { t } = useTranslation()
  const container = useRef<HTMLButtonElement>(null)
  const rotator = useRef<HTMLSpanElement>(null)
  const introTimeline = useRef<gsap.core.Timeline | null>(null)
  const userInteracted = useRef(false)
  const [flipped, setFlipped] = useState(false)
  const [tooltipDismissed, setTooltipDismissed] = useState(false)
  const tooltipId = useId()
  const { contextSafe } = useGSAP((_context, contextSafe) => {
    const element = rotator.current
    if (!element || !contextSafe || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let loadListener: (() => void) | undefined
    const pageReady = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
      } else {
        loadListener = () => resolve()
        window.addEventListener('load', loadListener, { once: true })
      }
    })
    const startIntro = contextSafe(() => {
      if (cancelled || userInteracted.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      introTimeline.current = gsap.timeline({ delay: 0.8 })
        .call(() => setFlipped(true))
        .to(element, { rotationY: 180, duration: 0.85, ease: 'power3.inOut' })
        .call(() => setFlipped(false), [], '+=0.3')
        .to(element, { rotationY: 0, duration: 0.85, ease: 'power3.inOut' })
    })

    Promise.all([
      pageReady,
      document.fonts.ready,
      ...Array.from(element.querySelectorAll('img'), (image) => image.decode()),
    ]).then(startIntro).catch(() => undefined)

    return () => {
      cancelled = true
      if (loadListener) window.removeEventListener('load', loadListener)
      introTimeline.current?.kill()
      introTimeline.current = null
    }
  }, { scope: container })

  const flipPortrait = () => contextSafe(() => {
    userInteracted.current = true
    introTimeline.current?.kill()
    introTimeline.current = null
    setTooltipDismissed(true)
    const nextFlipped = !flipped
    setFlipped(nextFlipped)
    gsap.to(rotator.current, {
      rotationY: nextFlipped ? 180 : 0,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.85,
      ease: 'power3.inOut',
      overwrite: true,
    })
  })()

  return (
    <article className="mx-auto block w-full max-w-[390px] border-0 bg-transparent p-0 text-center text-[#171717]">
      <div className="relative flex aspect-[3/4] flex-col items-center rounded-lg border-[3px] border-border bg-[#ff80ab] bg-[radial-gradient(#17171720_1px,transparent_1.5px)] bg-size-[14px_14px] p-[22px] shadow-[8px_8px_0_var(--border)] max-[380px]:p-4">
        <div className="flex w-full items-center justify-between gap-2 font-mono text-[10px] font-bold">
          <span className="flex items-center gap-1.5"><Code2 className="size-[17px]" aria-hidden="true" /> <ScrambleText text={'Profile Card'} /></span>
          <span>{': >'}</span>
        </div>
        <Crown className="my-0 mt-3 mb-2 ml-[35%] size-[38px] shrink-0 -rotate-12 fill-[#ffe16b] stroke-[3] max-[380px]:my-2 max-[380px]:size-7" aria-hidden="true" />
        <div className="my-auto flex w-full min-w-0 flex-col items-center">
          <span
            className="group/pfp relative block aspect-square w-[72%] shrink-0"
            data-tooltip-dismissed={tooltipDismissed}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch') setTooltipDismissed(false)
            }}
          >
            <button
              ref={container}
              type="button"
              className="block h-full w-full rounded-full border-0 bg-transparent p-0 text-inherit perspective-[1000px] [-webkit-tap-highlight-color:transparent] focus-visible:outline-[3px] focus-visible:outline-offset-[10px] focus-visible:outline-foreground"
              aria-label={t(flipped ? 'profile.showCartoon' : 'profile.showPhoto', { name })}
              aria-pressed={flipped}
              aria-describedby={tooltipId}
              onClick={flipPortrait}
              onFocus={() => setTooltipDismissed(false)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setTooltipDismissed(true)
              }}
            >
              <span ref={rotator} className="relative block h-full w-full transform-3d">
                <span className="absolute inset-0 backface-hidden [-webkit-backface-visibility:hidden]" aria-hidden={flipped}>
                  <Portrait src={cartoonSrc} name={name} cartoon />
                </span>
                <span className="absolute inset-0 rotate-y-180 backface-hidden [-webkit-backface-visibility:hidden]" aria-hidden={!flipped}>
                  <Portrait src={photoSrc} name={name} cartoon={false} />
                </span>
              </span>
            </button>
            <span
              id={tooltipId}
              role="tooltip"
              className="pointer-events-none invisible absolute right-0 bottom-0 z-10 max-w-full border-2 border-foreground bg-secondary-background px-2.5 py-1.5 text-left text-xs font-semibold text-foreground opacity-0 group-hover/pfp:visible group-hover/pfp:opacity-100 group-focus-within/pfp:visible group-focus-within/pfp:opacity-100 group-data-[tooltip-dismissed=true]/pfp:hidden"
            >
              <ScrambleText text={t(flipped ? 'profile.cartoonTooltip' : 'profile.photoTooltip')} />
            </span>
          </span>
          <h3 className="mt-[18px] max-w-full text-[32px] leading-[1.15] font-bold wrap-anywhere max-[380px]:mt-3 max-[380px]:text-[28px]">{name}<span className="text-[#a52e44]">.</span></h3>
          <span className="mt-[9px] max-w-full rounded-sm border-2 border-[#171717] bg-[#fff6dc] px-3 py-[5px] text-sm font-semibold wrap-anywhere"><ScrambleText text={role ?? t('profile.role')} /></span>
        </div>
        <span className="mt-[18px] flex shrink-0 -rotate-6 items-center gap-[7px] self-end rounded-[6px] border-[3px] border-[#171717] bg-[#ffe16b] px-3 py-[7px] text-sm font-bold shadow-[3px_3px_0_#171717] max-[380px]:mt-3">
          <Sparkles className="size-[18px]" aria-hidden="true" /> <ScrambleText text={'Never stop experimenting!'} />
        </span>
        <div className="mt-[22px] flex w-full items-center justify-between gap-2 font-mono text-[10px] font-bold max-[380px]:mt-3">
          <span><ScrambleText text={'< Just a scientist with life >'} /></span>
        </div>
      </div>
    </article>
  )
}