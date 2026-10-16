import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import ProfileCard from './ProfileCard'
import ScrambleText from '../ScrambleText'
import './contact.css'

gsap.registerPlugin(ScrollTrigger)

export default function ContactSection({ ready = true }: { ready?: boolean }) {
  const { t } = useTranslation()
  const section = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (!ready) return
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.contact-card', {
          opacity: 0,
          scale: 0.94,
          y: 30,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: section.current, start: 'top 75%', once: true },
        })
        gsap.from('.contact-xp-fill', {
          scaleX: 0,
          duration: 1.1,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: { trigger: section.current, start: 'top 75%', once: true },
        })
      })
      return () => media.revert()
    },
    { scope: section, dependencies: [ready], revertOnUpdate: true },
  )
  return (
    <section
      id="contact"
      ref={section}
      className="contact-section"
      aria-labelledby="contact-heading"
    >
      <header className="contact-heading">
        <p className="contact-eyebrow">
          05 / <ScrambleText text={t('contact.eyebrow')} />
        </p>
        <h2 id="contact-heading">
          <ScrambleText text={t('contact.title')} />
          <span aria-hidden="true"> ✳</span>
        </h2>
        <p>
          <ScrambleText text={t('contact.intro')} />
        </p>
      </header>
      <ProfileCard />
    </section>
  )
}
