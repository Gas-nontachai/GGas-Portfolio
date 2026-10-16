import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import CustomCursor from './component/CustomCursor'
import Navbar from './component/Navbar'
import Introduction from './component/home/Introduction'
import PlayerProfile from './component/home/PlayerProfile'
import CurrentlyExploring from './component/home/CurrentlyExploring'
import MainClass from './component/home/MainClass'
import JourneyTimeline from './component/journey/JourneyTimeline'
import ExperimentsSection from './component/experiments/ExperimentsSection'
import MyCreationsSection from './component/creations/MyCreationsSection'
import EndingSection from './component/ending/EndingSection'
import { useThemeStore } from './store/useThemeStore'

function App({ ready = true }: { ready?: boolean }) {
  const theme = useThemeStore((state) => state.theme)
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    const preventImageDrag = (event: DragEvent) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault()
    }
    // Capture also covers notebook portals rendered outside #root.
    document.addEventListener('dragstart', preventImageDrag, true)
    return () => document.removeEventListener('dragstart', preventImageDrag, true)
  }, [])

  useGSAP(
    () => {
      if (!ready) return
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.portfolio-panel', {
          y: 28,
          opacity: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out',
        })
        gsap.from('.intro-reveal', {
          y: 20,
          opacity: 0,
          duration: 0.65,
          stagger: 0.11,
          delay: 0.2,
          ease: 'power3.out',
        })
      })
      return () => media.revert()
    },
    { scope: main, dependencies: [ready], revertOnUpdate: true },
  )

  useLayoutEffect(() => {
    const dark = theme === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [theme])

  return (
    <>
      {ready && <CustomCursor />}
      <Navbar />
      <main
        ref={main}
        id="main"
        className="mx-auto grid w-full max-w-[1440px] shrink-0 grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,.85fr)] grid-rows-[1fr_1fr] content-start gap-5 px-8 py-6 [&_:is(a,button):focus-visible]:outline-[3px] [&_:is(a,button):focus-visible]:outline-foreground [&_:is(a,button):focus-visible]:outline-offset-[5px] max-[1150px]:max-w-[1000px] max-[1150px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] max-[1150px]:grid-rows-[auto_auto] max-[700px]:max-w-[520px] max-[700px]:grid-cols-[minmax(0,1fr)] max-[700px]:grid-rows-[auto] max-[700px]:gap-6 max-[700px]:px-5 max-[700px]:py-5"
      >
        <Introduction />
        <PlayerProfile />
        <CurrentlyExploring />
        <MainClass />
      </main>
      <JourneyTimeline ready={ready} />
      <ExperimentsSection ready={ready} />
      <MyCreationsSection ready={ready} />
      <EndingSection ready={ready} />
      <footer className="mt-auto flex justify-between gap-4 border-t-[3px] border-border bg-secondary-background px-6 py-5 font-mono text-xs sm:px-10">
        <span>GGAS PORTFOLIO</span>
        <span>2026</span>
      </footer>
    </>
  )
}

export default App
