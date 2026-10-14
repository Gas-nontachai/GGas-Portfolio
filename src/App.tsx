import { useLayoutEffect } from 'react'
import { Button } from '@risky2k1/neobrutalism-ui'
import { Moon, Sun } from 'lucide-react'
import CustomCursor from './component/CustomCursor'
import InteractiveProfileCard from './component/profile/InteractiveProfileCard'
import { useThemeStore } from './store/useThemeStore'

const modes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

function App() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  useLayoutEffect(() => {
    const dark = theme === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [theme])

  return (
    <>
      <CustomCursor />
      <header className="flex items-center justify-between gap-4 border-b-[3px] border-border bg-secondary-background px-6 py-5 sm:px-10">
        <a href="#main" className="text-2xl font-bold text-foreground no-underline">GGAS<span className="text-[#df563d]">.</span></a>
        <span className="font-mono text-xs">PERSONAL SPACE / 01</span>
      </header>
      <main id="main" className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-6 py-14 md:grid-cols-2 md:gap-20 md:py-24">
        <section aria-labelledby="appearance-heading" className="min-w-0">
          <p className="mb-4 font-mono text-xs font-bold">PREFERENCES</p>
          <h1 id="appearance-heading" className="mb-10 text-4xl leading-tight font-bold sm:text-5xl">Appearance<span className="text-[#df563d]">.</span></h1>
          <fieldset className="min-w-0">
            <legend className="mb-5 font-bold">Color mode</legend>
            <div role="group" aria-label="Color mode" className="grid grid-cols-2 gap-3">
              {modes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? 'default' : 'neutral'}
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                  className="h-16 min-w-0 flex-col gap-1 px-2 text-xs aria-pressed:outline-2 aria-pressed:outline-offset-4 aria-pressed:outline-foreground sm:h-12 sm:flex-row sm:gap-2 sm:text-sm"
                >
                  <Icon aria-hidden="true" />{label}
                </Button>
              ))}
            </div>
          </fieldset>
          <div className="mt-10 flex gap-2" aria-label="Theme palette">
            {['#f5d547', '#f49ab5', '#a9d89a'].map((color) => (
              <span key={color} title={color} className="size-6 border-2 border-border" style={{ backgroundColor: color }} />
            ))}
          </div>
        </section>
        <section aria-labelledby="preview-heading" className="min-w-0">
          <h2 id="preview-heading" className="mb-4 font-mono text-xs font-bold">PREVIEW</h2>
          <InteractiveProfileCard />
        </section>
      </main>
      <footer className="flex justify-between gap-4 border-t-[3px] border-border bg-secondary-background px-6 py-5 font-mono text-xs sm:px-10"><span>GGAS PORTFOLIO</span><span>2026</span></footer>
    </>
  )
}

export default App
