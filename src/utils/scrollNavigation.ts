import type { MouseEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

let scrollTween: gsap.core.Tween | null = null

export function scrollToSection(hash: string, { offsetY = 24, duration = 0.7 } = {}) {
  if (!hash.startsWith('#') || hash.length === 1) return null

  const target = document.getElementById(hash.slice(1))
  if (!target) return null

  scrollTween?.kill()

  if (window.location.hash !== hash) {
    window.history.pushState(window.history.state, '', hash)
  }

  scrollTween = gsap.to(window, {
    scrollTo: { y: target, offsetY, autoKill: true },
    duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration,
    ease: 'power2.out',
  })

  return scrollTween
}

export function handleScrollNavigation(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const link = event.currentTarget
  if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return
  if (link.origin !== window.location.origin || link.pathname !== window.location.pathname || link.search !== window.location.search) return

  if (scrollToSection(link.hash)) event.preventDefault()
}