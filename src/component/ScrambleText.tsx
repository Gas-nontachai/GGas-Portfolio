import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789กขคงจชซดตนบปผพมยรลวสห'

export default function ScrambleText({ text }: { text: string }) {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const container = useRef<HTMLSpanElement>(null)
  const overlay = useRef<HTMLSpanElement>(null)
  const previousLanguage = useRef(language)

  useEffect(() => {
    if (previousLanguage.current === language) return
    previousLanguage.current = language
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wrapper = container.current
    const animated = overlay.current
    if (!wrapper || !animated) return

    const started = performance.now()
    const glyphs = Array.from(text)
    const render = () => {
      const progress = Math.min(1, (performance.now() - started) / 520)
      animated.textContent = glyphs.map((character, index) => (
        /\s/u.test(character) || index < Math.floor(progress * glyphs.length)
          ? character
          : characters[Math.floor(Math.random() * characters.length)]
      )).join('')
      if (progress === 1) {
        wrapper.removeAttribute('data-scrambling')
        window.clearInterval(timer)
      }
    }

    wrapper.setAttribute('data-scrambling', 'true')
    const timer = window.setInterval(render, 40)
    render()
    return () => {
      window.clearInterval(timer)
      wrapper.removeAttribute('data-scrambling')
      animated.textContent = ''
    }
  }, [text, language])

  return (
    <span ref={container} className="group/scramble relative inline-block max-w-full align-bottom">
      <span className="group-data-[scrambling=true]/scramble:opacity-0">{text}</span>
      <span ref={overlay} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden group-data-[scrambling=true]/scramble:block" />
    </span>
  )
}