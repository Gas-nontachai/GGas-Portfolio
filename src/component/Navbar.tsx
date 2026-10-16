import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import gsap from 'gsap'
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
  { href: '#profile-card', labelKey: 'nav.businessCard' },
] as const

function Navbar() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const navbarRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navigationHidden = useRef<boolean | null>(null)
  const [compact, setCompact] = useState(() => window.matchMedia('(width < 1000px)').matches)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHref, setActiveHref] = useState('#main')
  const [navbarHidden, setNavbarHidden] = useState(false)
  const [tooltipDismissed, setTooltipDismissed] = useState(false)
  const [languageTooltipDismissed, setLanguageTooltipDismissed] = useState(false)

  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    handleScrollNavigation(event)
    if (!event.defaultPrevented) return
    const hash = event.currentTarget.hash
    const hideNavbar = hash !== '#main' && hash !== '#my-creations'
    navigationHidden.current = hideNavbar
    setMenuOpen(false)
    setNavbarHidden(hideNavbar)
    const target = document.getElementById(event.currentTarget.hash.slice(1))
    if (target) {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1')
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
      }
      target.focus({ preventScroll: true })
    }
  }

  useEffect(() => {
    const query = window.matchMedia('(width < 1000px)')
    const updateLayout = () => {
      if (query.matches && menuRef.current?.contains(document.activeElement)) {
        menuButtonRef.current?.focus({ preventScroll: true })
      } else if (!query.matches && document.activeElement === menuButtonRef.current) {
        menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
      }
      setCompact(query.matches)
      setMenuOpen(false)
    }
    query.addEventListener('change', updateLayout)
    return () => query.removeEventListener('change', updateLayout)
  }, [])

  useLayoutEffect(() => {
    const menu = menuRef.current!
    if (!compact) {
      gsap.set(menu, { clearProps: 'height,opacity,visibility,transform' })
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const animation = gsap.to(menu, {
      height: menuOpen ? 'auto' : 0,
      autoAlpha: menuOpen ? 1 : 0,
      y: menuOpen ? 0 : -6,
      duration: reduced ? 0 : 0.24,
      ease: 'power2.out',
      overwrite: true,
    })
    if (menuOpen) {
      gsap.set(menu, { visibility: 'visible' })
      menu.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
    }
    return () => {
      animation.kill()
    }
  }, [compact, menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !navbarRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setMenuOpen(false)
      menuButtonRef.current?.focus({ preventScroll: true })
    }
    const onFocusOut = (event: FocusEvent) => {
      if (event.target instanceof Node && !navbarRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusOut)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusOut)
    }
  }, [menuOpen])

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY)
    const journeyShell = document.querySelector<HTMLElement>('.journey-scroll-shell')

    const handleScroll = () => {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const currentY = Math.min(maxY, Math.max(0, window.scrollY))
      const distance = currentY - previousY
      let currentSection = '#main'
      for (const { href } of navigationItems) {
        if (!href.startsWith('#')) continue
        const section = href === '#journey' ? journeyShell : document.getElementById(href.slice(1))
        if (
          section &&
          section.getBoundingClientRect().top <= Math.min(window.innerHeight * 0.3, 200)
        ) {
          currentSection = href
        }
      }
      setActiveHref(currentSection)

      if (navigationHidden.current !== null) {
        setNavbarHidden(navigationHidden.current)
        previousY = currentY
        return
      }

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

    const resumeScrollVisibility = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)
      )
        return
      navigationHidden.current = null
    }

    window.addEventListener('wheel', resumeScrollVisibility, { passive: true })
    window.addEventListener('touchmove', resumeScrollVisibility, { passive: true })
    window.addEventListener('keydown', resumeScrollVisibility)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    const initialFrame = window.requestAnimationFrame(handleScroll)
    return () => {
      window.cancelAnimationFrame(initialFrame)
      window.removeEventListener('wheel', resumeScrollVisibility)
      window.removeEventListener('touchmove', resumeScrollVisibility)
      window.removeEventListener('keydown', resumeScrollVisibility)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <header
      ref={navbarRef}
      className="sticky top-6 z-50 mx-auto mt-6 grid w-[calc(100%-64px)] max-w-5xl shrink-0 grid-cols-[auto_1fr_auto] items-center gap-5 rounded-2xl border-[3px] border-[var(--navbar-ink)] bg-secondary-background px-4 py-2.5 shadow-[5px_5px_0_var(--navbar-ink)] [--navbar-ink:var(--border)] transition-[translate,opacity,visibility] [transition-duration:280ms,220ms,280ms] ease-out data-[hidden=true]:pointer-events-none data-[hidden=true]:invisible data-[hidden=true]:-translate-y-[calc(100%+32px)] data-[hidden=true]:opacity-0 [&_:is(a,button):focus-visible]:outline-[3px] [&_:is(a,button):focus-visible]:outline-foreground [&_:is(a,button):focus-visible]:outline-offset-6 max-[1000px]:grid-cols-[1fr_auto] max-[1000px]:gap-x-4 max-[800px]:top-[18px] max-[800px]:mt-[18px] max-[800px]:w-[calc(100%-40px)] max-[800px]:px-4 max-[420px]:gap-x-2 max-[420px]:px-3 motion-reduce:transition-none"
      data-hidden={navbarHidden && !menuOpen}
      inert={navbarHidden && !menuOpen}
    >
      <a
        href="#main"
        onClick={navigate}
        className="flex w-fit items-center gap-2.5 text-xl leading-none font-bold text-foreground no-underline max-[420px]:gap-1.5 max-[420px]:text-base"
        aria-label={t('nav.brand')}
      >
        <img
          src={favicon}
          className="size-8 shrink-0 max-[420px]:size-6"
          alt=""
          aria-hidden="true"
        />
        Portfolio
        <span className="-ml-2.5 text-[#df563d] max-[420px]:-ml-1.5">.</span>
      </a>
      <nav
        ref={menuRef}
        id="navbar-navigation"
        className="flex min-w-0 items-center justify-center gap-7 [&_a]:py-2.5 [&_a]:text-sm [&_a]:font-bold [&_a]:whitespace-nowrap [&_a]:text-foreground [&_a]:no-underline [&_a]:underline-offset-[5px] [&_a:hover]:underline [&_a:hover]:decoration-2 max-[1000px]:invisible max-[1000px]:absolute max-[1000px]:inset-x-0 max-[1000px]:top-[calc(100%+12px)] max-[1000px]:max-h-[calc(100dvh-140px-env(safe-area-inset-bottom,0px))] max-[1000px]:flex-col max-[1000px]:items-stretch max-[1000px]:justify-start max-[1000px]:gap-1 max-[1000px]:overflow-x-hidden max-[1000px]:overflow-y-auto max-[1000px]:overscroll-contain max-[1000px]:rounded-lg max-[1000px]:border-[3px] max-[1000px]:border-[var(--navbar-ink)] max-[1000px]:bg-secondary-background max-[1000px]:p-3 max-[1000px]:shadow-[5px_5px_0_var(--navbar-ink)]"
        aria-label={t('nav.label')}
        inert={compact && !menuOpen}
      >
        {navigationItems.map(({ href, labelKey }) => (
          <a
            key={href}
            href={href}
            aria-current={activeHref === href ? 'location' : undefined}
            className="aria-[current=location]:underline aria-[current=location]:decoration-2 max-[1000px]:flex max-[1000px]:min-h-11 max-[1000px]:items-center max-[1000px]:border-2 max-[1000px]:border-transparent max-[1000px]:px-3 max-[1000px]:aria-[current=location]:border-[var(--navbar-ink)] max-[1000px]:aria-[current=location]:bg-[#ffd43b] max-[1000px]:aria-[current=location]:text-[#171717]"
            onClick={navigate}
          >
            <ScrambleText text={t(labelKey)} />
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-[18px] max-[420px]:gap-2">
        <div
          className="group relative size-11 shrink-0"
          data-tooltip-dismissed={tooltipDismissed}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') setTooltipDismissed(false)
          }}
        >
          <button
            type="button"
            className="grid size-11 place-items-center rounded-none border-[3px] border-[var(--navbar-ink)] bg-secondary-background p-0 text-[var(--navbar-ink)] shadow-[4px_4px_0_var(--navbar-ink)] transition-[translate,box-shadow,background-color] duration-[120ms] ease-[ease] hover:bg-[#ffd43b] hover:text-[#171717] active:translate-x-1 active:translate-y-1 active:shadow-none"
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
          className="group relative size-11 shrink-0"
          data-tooltip-dismissed={languageTooltipDismissed}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') setLanguageTooltipDismissed(false)
          }}
        >
          <button
            type="button"
            className="grid size-11 place-items-center rounded-none border-[3px] border-[var(--navbar-ink)] bg-secondary-background p-0 text-sm leading-none font-bold text-[var(--navbar-ink)] shadow-[4px_4px_0_var(--navbar-ink)] transition-[translate,box-shadow,background-color] duration-[120ms] ease-[ease] hover:bg-[#ffd43b] hover:text-[#171717] active:translate-x-1 active:translate-y-1 active:shadow-none"
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
        <button
          ref={menuButtonRef}
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-none border-[3px] border-[var(--navbar-ink)] bg-secondary-background p-0 text-[var(--navbar-ink)] shadow-[4px_4px_0_var(--navbar-ink)] transition-[translate,box-shadow,background-color] duration-[120ms] hover:bg-[#ffd43b] hover:text-[#171717] active:translate-x-1 active:translate-y-1 active:shadow-none min-[1000px]:hidden"
          aria-label={t(menuOpen ? 'nav.closeMenu' : 'nav.openMenu')}
          aria-expanded={menuOpen}
          aria-controls="navbar-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="size-5 stroke-[1.5]" aria-hidden="true" />
          ) : (
            <Menu className="size-5 stroke-[1.5]" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  )
}

export default Navbar
