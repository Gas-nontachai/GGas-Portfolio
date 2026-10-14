import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/useThemeStore'

gsap.registerPlugin(ScrollToPlugin)

function Navbar() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const navbarRef = useRef<HTMLElement>(null)
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null)
  const [navbarHidden, setNavbarHidden] = useState(false)

  const handleNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const hash = event.currentTarget.hash
    const target = document.getElementById(hash.slice(1))
    if (!target) return

    event.preventDefault()
    scrollTweenRef.current?.kill()

    if (window.location.hash !== hash) {
      window.history.pushState(window.history.state, '', hash)
    }

    scrollTweenRef.current = gsap.to(window, {
      scrollTo: { y: target, offsetY: 24, autoKill: true },
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.7,
      ease: 'power2.out',
    })
  }

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY)

    const handleScroll = () => {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const currentY = Math.min(maxY, Math.max(0, window.scrollY))
      const distance = currentY - previousY

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
    return () => {
      window.removeEventListener('scroll', handleScroll)
      scrollTweenRef.current?.kill()
    }
  }, [])

  return (
    <header
      ref={navbarRef}
      className="sticky top-6 z-50 mx-auto mt-6 grid w-[calc(100%-64px)] max-w-6xl shrink-0 grid-cols-[auto_1fr_auto] items-center gap-6 rounded-2xl border-[3px] border-[var(--navbar-ink)] bg-secondary-background px-5 py-3.5 shadow-[5px_5px_0_var(--navbar-ink)] [--navbar-ink:#171717] [.dark_&]:[--navbar-ink:#f3f3ee] transition-[transform,opacity,visibility] [transition-duration:280ms,220ms,280ms] ease-out data-[hidden=true]:pointer-events-none data-[hidden=true]:invisible data-[hidden=true]:-translate-y-[calc(100%+32px)] data-[hidden=true]:opacity-0 [&_:is(a,button):focus-visible]:outline-[3px] [&_:is(a,button):focus-visible]:outline-foreground [&_:is(a,button):focus-visible]:outline-offset-6 max-[800px]:top-[18px] max-[800px]:mt-[18px] max-[800px]:w-[calc(100%-40px)] max-[800px]:grid-cols-[1fr_auto] max-[800px]:gap-x-4 max-[800px]:gap-y-3 max-[800px]:px-4 max-[420px]:gap-x-2 max-[420px]:px-3 motion-reduce:transition-none"
      data-hidden={navbarHidden}
      inert={navbarHidden}
    >
      <a href="#main" onClick={handleNavigation} className="navbar-brand" aria-label="GGAS home">
        <span className="navbar-brand-mark" aria-hidden="true">G</span>
        GGAS<span className="navbar-brand-dot">.</span>
      </a>
      <nav className="navbar-links" aria-label="Main navigation">
        <a href="#main" onClick={handleNavigation}>Home</a>
        <a href="#appearance" onClick={handleNavigation}>Appearance</a>
        <a href="#profile" onClick={handleNavigation}>Profile</a>
      </nav>
      <div className="navbar-actions">
        <a href="#profile" onClick={handleNavigation} className="navbar-cta">VIEW MY PROFILE</a>
        <div className="theme-switch-wrapper">
          <button
            type="button"
            className="theme-switch"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-describedby="theme-switch-tooltip"
          >
            {theme === 'light' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          </button>
          <span id="theme-switch-tooltip" role="tooltip" className="theme-switch-tooltip">
            {theme === 'light' ? 'Dark' : 'Light'} theme
          </span>
        </div>
      </div>
    </header>
  )
}

export default Navbar