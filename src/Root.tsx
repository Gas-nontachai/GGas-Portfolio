import { Suspense, lazy, useLayoutEffect } from 'react'
import LoadingScreen from './component/LoadingScreen'
import { useThemeStore } from './store/useThemeStore'

const isLinktree = /^\/linktree\/?$/.test(window.location.pathname)
const Page = isLinktree
  ? lazy(() => import('./pages/LinktreePage'))
  : lazy(() => import('./pages/PortfolioPage'))

export default function Root() {
  const theme = useThemeStore((state) => state.theme)
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])
  return (
    <Suspense fallback={<LoadingScreen phase="bootstrap" />}>
      <Page />
    </Suspense>
  )
}
