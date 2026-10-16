import resumeUrl from '../assets/resume/CV Nonthachai - Full Stack Developer.pdf?url'
import avatar from '../assets/profile/nontachai.jpg'
import { profileConfig } from '../config/profile'

export const contactProfile = {
  name: profileConfig.name,
  avatar,
  xp: 72,
  tags: ['Developer', 'Maker', 'Explorer'],
  footer: 'Made with ♥ by ThangGas',
} as const

export const contactLinks = [
  { id: 'portfolio', labelKey: 'contact.portfolio', href: '/', newTab: false },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/nonthachai-phosri-345668321/',
    newTab: true,
  },
  { id: 'github', label: 'GitHub', href: 'https://github.com/Gas-nontachai', newTab: true },
  { id: 'resume', labelKey: 'contact.resume', href: resumeUrl, newTab: true },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/nontachimura/',
    newTab: true,
  },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@nontachai001', newTab: true },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/NontachaiProsri',
    newTab: true,
  },
  { id: 'line', label: 'LINE', href: 'https://line.me/ti/p/1cLm52TnZu', newTab: true },
  { id: 'email', labelKey: 'contact.email', href: 'mailto:ggasnontachai@gmail.com', newTab: false },
  { id: 'phone', labelKey: 'contact.phone', href: 'tel:+66885639233', newTab: false },
] as const

export type ContactLinkData = (typeof contactLinks)[number]

export const primaryContactLinks = ['email', 'github', 'linkedin', 'resume'].map((id) =>
  contactLinks.find((link) => link.id === id)!,
)

export const socialContactLinks = contactLinks.filter(
  (link) =>
    link.id === 'facebook' || link.id === 'instagram' || link.id === 'tiktok' || link.id === 'line',
)
