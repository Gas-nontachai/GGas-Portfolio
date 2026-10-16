import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { contactLinks, contactProfile } from '../data/contactLinks'
import { useThemeStore } from '../store/useThemeStore'
import ContactLink from '../component/contact/ContactLink'
import PhotoFrame from '../component/journey/widgets/PhotoFrame'
import ScrambleText from '../component/ScrambleText'
import '../component/contact/contact.css'

export default function LinktreePage() {
  const { t, i18n } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const language = i18n.resolvedLanguage === 'th' ? 'th' : 'en'
  return (
    <main className="linktree-page">
      <div className="linktree-controls">
        <button
          type="button"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={t('theme.switch', {
            mode: t(`theme.${theme === 'light' ? 'dark' : 'light'}`),
          })}
        >
          {theme === 'light' ? (
            <Moon size={20} aria-hidden="true" />
          ) : (
            <Sun size={20} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => void i18n.changeLanguage(language === 'en' ? 'th' : 'en')}
          aria-label={t('language.switch')}
        >
          <ScrambleText text={language.toUpperCase()} />
        </button>
      </div>
      <header className="linktree-header">
        <PhotoFrame
          className="linktree-polaroid"
          variant="polaroid"
          src={contactProfile.avatar}
          alt={t('profile.photo', { name: contactProfile.name })}
          caption={contactProfile.name}
          scrambleCaption={false}
        />
        <h1>
          {contactProfile.name}
          <span>.</span>
        </h1>
        <p>{contactProfile.tags.join(' • ')}</p>
      </header>
      <nav className="linktree-links" aria-label={t('contact.links')}>
        {contactLinks.map((link, index) => (
          <div key={link.id} style={{ animationDelay: `${index * 35}ms` }}>
            <ContactLink link={link} />
          </div>
        ))}
      </nav>
      <footer>{contactProfile.footer}</footer>
    </main>
  )
}
