import { useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../store/useThemeStore'
import favicon from '../assets/g-neobrutal-favicon.svg'
import ScrambleText from './ScrambleText'
import { handleScrollNavigation } from '../utils/scrollNavigation'

const navigationItems = [
  { href: '#main', labelKey: 'nav.home' },
  { href: '#journey', labelKey: 'nav.journey' },
  { href: '#current-experiments', labelKey: 'nav.experiments' },
  { href: '#my-creations', labelKey: 'nav.creations' },
] as const

function Navbar() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const navbarRef = useRef<HTMLElement>(null)
  const [navbarHidden, setNavbarHidden] = useState(false)
  const [tooltipDismissed, setTooltipDismissed] = useState(false)
  const [languageTooltipDismissed, setLanguageTooltipDismissed] = useState(false)

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY)
    const journeyShell = document.querySelector<HTMLElement>('.journey-scroll-shell')

    const handleScroll = () => {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const currentY = Math.min(maxY, Math.max(0, window.scrollY))
      const distance = currentY - previousY

      // The journey's own controls occupy the top of the viewport. Keep the
      // floating navbar hidden here, including during reverse/programmatic scroll.
      if (journeyShell) {
        const bounds = journeyShell.getBoundingClientRect()
        const navbarClearance = (navbarRef.current?.offsetHeight ?? 0) + 48
        if (bounds.top <= navbarClearance && bounds.bottom > 0) {
          setNavbarHidden(true)
          previousY = currentY
          return
        }
      }

      if (currentY <= 80) {
        setNavbarHidden(false)
        previousY = currentY
        return
      }

      if (Math.abs(distance) < 8) return

      const navbarFocused = navbarRef.current?.contains(document.activeElement)
      setNavbarHidden(distance > 0 && !navbarFocused)
      previousY = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    const initialFrame = window.requestAnimationFrame(handleScroll)
    return () => {
      window.cancelAnimationFrame(initialFrame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <header
      ref={navbarRef}
      className="sticky top-6 z-50 mx-auto mt-6 grid w-[calc(100%-64px)] max-w-5xl shrink-0 grid-cols-[auto_1fr_auto] items-center gap-5 rounded-2xl border-[3px] border-[var(--navbar-ink)] bg-secondary-background px-4 py-2.5 shadow-[5px_5px_0_var(--navbar-ink)] [--navbar-ink:var(--border)] transition-[translate,opacity,visibility] [transition-duration:280ms,220ms,280ms] ease-out data-[hidden=true]:pointer-events-none data-[hidden=true]:invisible data-[hidden=true]:-translate-y-[calc(100%+32px)] data-[hidden=true]:opacity-0 [&_:is(a,button):focus-visible]:outline-[3px] [&_:is(a,button):focus-visible]:outline-foreground [&_:is(a,button):focus-visible]:outline-offset-6 max-[800px]:top-[18px] max-[800px]:mt-[18px] max-[800px]:w-[calc(100%-40px)] max-[800px]:grid-cols-[1fr_auto] max-[800px]:gap-x-4 max-[800px]:gap-y-3 max-[800px]:px-4 max-[420px]:gap-x-2 max-[420px]:px-3 motion-reduce:transition-none"
      data-hidden={navbarHidden}
      inert={navbarHidden}
    >
      <a
        href="#main"
        onClick={handleScrollNavigation}
        className="flex w-fit items-center gap-2.5 text-xl leading-none font-bold text-foreground no-underline max-[420px]:gap-1.5"
        aria-label={t('nav.brand')}
      >
        <img src={favicon} className="size-8 shrink-0" alt="" aria-hidden="true" />
        Portfolio
        <span className="-ml-2.5 text-[#df563d] max-[420px]:-ml-1.5">.</span>
      </a>
      <nav
        className="flex items-center justify-center gap-7 [&_a]:py-2.5 [&_a]:text-sm [&_a]:font-bold [&_a]:text-foreground [&_a]:no-underline [&_a]:underline-offset-[5px] [&_a:hover]:underline [&_a:hover]:decoration-2 max-[800px]:col-span-full max-[800px]:row-start-2 max-[800px]:justify-between max-[800px]:gap-4 max-[800px]:border-t-2 max-[800px]:border-[var(--navbar-ink)] max-[800px]:pt-1 max-[420px]:[&_a]:text-xs"
        aria-label={t('nav.label')}
      >
        {navigationItems.map(({ href, labelKey }) => (
          <a key={href} href={href} onClick={handleScrollNavigation}>
            <ScrambleText text={t(labelKey)} />
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-[18px] max-[420px]:gap-2.5">
        <div
          className="group relative size-10 shrink-0"
          data-tooltip-dismissed={tooltipDismissed}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') setTooltipDismissed(false)
          }}
        >
          <button
            type="button"
            className="grid size-10 place-items-center rounded-none border-[3px] border-[var(--navbar-ink)] bg-secondary-background p-0 text-[var(--navbar-ink)] shadow-[4px_4px_0_var(--navbar-ink)] transition-[translate,box-shadow,background-color] duration-[120ms] ease-[ease] hover:bg-[#ffd43b] hover:text-[#171717] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => {
              setTooltipDismissed(true)
              setTheme(theme === 'light' ? 'dark' : 'light')
            }}
            onFocus={() => setTooltipDismissed(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setTooltipDismissed(true)
            }}
            aria-label={t('theme.switch', {
              mode: t(`theme.${theme === 'light' ? 'dark' : 'light'}`),
            })}
            aria-describedby="theme-switch-tooltip"
          >
            {theme === 'light' ? (
              <Moon className="size-5 stroke-[1.5]" aria-hidden="true" />
            ) : (
              <Sun className="size-5 stroke-[1.5]" aria-hidden="true" />
            )}
          </button>
          <span
            id="theme-switch-tooltip"
            role="tooltip"
            className="pointer-events-none invisible absolute top-[calc(100%+14px)] right-0 z-10 border-2 border-[var(--navbar-ink)] bg-secondary-background px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-foreground opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 group-data-[tooltip-dismissed=true]:hidden"
          >
            <ScrambleText
              text={t('theme.tooltip', {
                mode: t(`theme.${theme === 'light' ? 'dark' : 'light'}`),
              })}
            />
          </span>
        </div>
        <div
          className="group relative size-10 shrink-0"
          data-tooltip-dismissed={languageTooltipDismissed}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') setLanguageTooltipDismissed(false)
          }}
        >
          <button
            type="button"
            className="grid size-10 place-items-center rounded-none border-[3px] border-[var(--navbar-ink)] bg-secondary-background p-0 text-sm font-bold text-[var(--navbar-ink)] shadow-[4px_4px_0_var(--navbar-ink)] transition-[translate,box-shadow,background-color] duration-[120ms] ease-[ease] hover:bg-[#ffd43b] hover:text-[#171717] active:translate-x-1 active:translate-y-1 active:shadow-none"
            onClick={() => {
              setLanguageTooltipDismissed(true)
              void i18n.changeLanguage(language === 'en' ? 'th' : 'en')
            }}
            onFocus={() => setLanguageTooltipDismissed(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setLanguageTooltipDismissed(true)
            }}
            aria-label={t('language.switch')}
            aria-describedby="language-switch-tooltip"
          >
            <span aria-hidden="true">
              <ScrambleText text={language.toUpperCase()} />
            </span>
          </button>
          <span
            id="language-switch-tooltip"
            role="tooltip"
            className="pointer-events-none invisible absolute top-[calc(100%+14px)] right-0 z-10 border-2 border-[var(--navbar-ink)] bg-secondary-background px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-foreground opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 group-data-[tooltip-dismissed=true]:hidden"
          >
            <ScrambleText text={language === 'th' ? 'English' : 'ภาษาไทย'} />
          </span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
