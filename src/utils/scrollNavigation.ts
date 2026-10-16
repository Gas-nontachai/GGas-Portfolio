import type { MouseEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

export const scrollNavigationEvent = 'portfolio:scroll-navigation'

let scrollTween: gsap.core.Tween | null = null

export function isScrollNavigationActive() {
  return scrollTween?.isActive() ?? false
}

export function scrollToSection(
  hash: string,
  {
    offsetY,
    duration = 0.7,
    ease = 'power2.out',
  }: { offsetY?: number; duration?: number; ease?: 'power2.out' | 'none' } = {},
) {
  if (!hash.startsWith('#') || hash.length === 1) return null

  const target = document.getElementById(hash.slice(1))
  if (!target) return null

  // Sticky sections must navigate to their document anchor, not their current sticky position.
  const destination =
    hash === '#journey' ? (target.closest<HTMLElement>('.journey-scroll-shell') ?? target) : target
  let destinationY: number | HTMLElement = destination
  let navbarOffset = 0
  if (hash === '#my-creations' || hash === '#profile-card') {
    destinationY = 0
    let element: HTMLElement | null = destination
    while (element) {
      destinationY += element.offsetTop
      const parent = element.offsetParent as HTMLElement | null
      if (parent) destinationY += parent.clientTop
      element = parent
    }
    const navbar = document.getElementById('navbar-navigation')?.closest('header')
    if (navbar && hash !== '#my-creations') {
      navbarOffset =
        navbar.offsetHeight + (Number.parseFloat(getComputedStyle(navbar).top) || 0) + 16
    }
  }
  window.dispatchEvent(new Event(scrollNavigationEvent))
  scrollTween?.kill()

  if (window.location.hash !== hash) {
    window.history.pushState(window.history.state, '', hash)
  }

  scrollTween = gsap.to(window, {
    scrollTo: {
      y: hash === '#main' ? 0 : destinationY,
      offsetY: offsetY ?? navbarOffset,
      autoKill: true,
    },
    duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration,
    ease,
  })

  return scrollTween
}

export function handleScrollNavigation(event: MouseEvent<HTMLAnchorElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return

  const link = event.currentTarget
  if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return
  if (
    link.origin !== window.location.origin ||
    link.pathname !== window.location.pathname ||
    link.search !== window.location.search
  )
    return

  if (scrollToSection(link.hash)) event.preventDefault()
}
