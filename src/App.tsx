import { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import CustomCursor from './component/CustomCursor'
import Navbar from './component/Navbar'
import ProfileOrbit from './component/profile/ProfileOrbit'
import { useThemeStore } from './store/useThemeStore'

function App() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)

  useLayoutEffect(() => {
    const dark = theme === 'dark'
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [theme])

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main id="main" className="mx-auto grid w-full max-w-5xl flex-1 scroll-mt-6 items-center gap-12 px-6 py-14 md:grid-cols-2 md:gap-20 md:py-24">
        <section id="appearance" aria-labelledby="appearance-heading" className="min-w-0 scroll-mt-6">
          <p className="mb-4 font-mono text-xs font-bold">{t('appearance.preferences')}</p>
          <h1 id="appearance-heading" className="mb-10 text-4xl leading-tight font-bold sm:text-5xl">{t('appearance.heading')}<span className="text-[#df563d]">.</span></h1>
          <div className="mt-10 flex gap-2" aria-label={t('appearance.palette')}>
            {['#f5d547', '#f49ab5', '#a9d89a'].map((color) => (
              <span key={color} title={color} className="size-6 border-2 border-border" style={{ backgroundColor: color }} />
            ))}
          </div>
        </section>
        <section id="profile" aria-labelledby="preview-heading" className="min-w-0 scroll-mt-6">
          <h2 id="preview-heading" className="mb-4 font-mono text-xs font-bold">{t('appearance.preview')}</h2>
          <ProfileOrbit />
        </section>
      </main>
      <footer className="flex justify-between gap-4 border-t-[3px] border-border bg-secondary-background px-6 py-5 font-mono text-xs sm:px-10"><span>GGAS PORTFOLIO</span><span>2026</span></footer>
    </>
  )
}

export default App
