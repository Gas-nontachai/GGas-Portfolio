import {
  ArrowUpRight,
  FileText,
  Code2,
  BriefcaseBusiness,
  Camera,
  Users,
  Mail,
  Phone,
  Globe,
  MessageCircle,
  Music2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ContactLinkData } from '../../data/contactLinks'
import ScrambleText from '../ScrambleText'

const icons = {
  portfolio: Globe,
  linkedin: BriefcaseBusiness,
  github: Code2,
  resume: FileText,
  instagram: Camera,
  tiktok: Music2,
  facebook: Users,
  line: MessageCircle,
  email: Mail,
  phone: Phone,
}

export default function ContactLink({ link }: { link: ContactLinkData }) {
  const { t } = useTranslation()
  const Icon = icons[link.id]
  return (
    <a
      className={`contact-link${link.id === 'portfolio' || link.id === 'email' ? ' contact-link--primary' : ''}`}
      href={link.href}
      target={link.newTab ? '_blank' : undefined}
      rel={link.newTab ? 'noopener noreferrer' : undefined}
    >
      <Icon size={21} aria-hidden="true" />
      <span>{'labelKey' in link ? <ScrambleText text={t(link.labelKey)} /> : link.label}</span>
      {link.newTab && <span className="sr-only"> ({t('contact.newTab')})</span>}
      <ArrowUpRight className="contact-link-arrow" size={18} aria-hidden="true" />
    </a>
  )
}
