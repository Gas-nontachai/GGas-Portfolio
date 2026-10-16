import { Code2, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { contactProfile, primaryContactLinks } from '../../data/contactLinks'
import ContactLink from './ContactLink'
import ScrambleText from '../ScrambleText'
import SocialLinks from './SocialLinks'

export default function ProfileCard() {
  const { t } = useTranslation()
  return (
    <article className="contact-card" aria-labelledby="contact-profile-name">
      <header className="contact-card-bar">
        <span>
          <Code2 size={20} aria-hidden="true" /> THANGGAS — PROFILE
        </span>
        <span aria-hidden="true">: &gt;</span>
      </header>
      <div className="contact-card-body">
        <div className="contact-identity">
          <div className="contact-portrait">
            <img
              src={contactProfile.avatar}
              width="200"
              height="200"
              alt={t('profile.photo', { name: contactProfile.name })}
            />
            <span className="contact-portrait-star" aria-hidden="true">
              <Sparkles size={28} />
            </span>
          </div>
          <div>
            <p className="contact-player-label">PLAYER / 01</p>
            <div className="contact-name-row">
              <h3 id="contact-profile-name">
                {contactProfile.name}
                <span>.</span>
              </h3>
              <SocialLinks />
            </div>
            <p className="contact-role">
              <ScrambleText text={t('contact.role')} />
            </p>
            <div className="contact-tags">
              {contactProfile.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="contact-bio">
          <ScrambleText text={t('contact.bio')} />
        </p>
        <div className="contact-xp" aria-hidden="true">
          <div className="contact-xp-label">
            <span>
              <ScrambleText text={t('contact.xp')} />
            </span>
            <span>{contactProfile.xp}%</span>
          </div>
          <div className="contact-xp-track">
            <span className="contact-xp-fill" style={{ width: `${contactProfile.xp}%` }} />
          </div>
          <p>
            <ScrambleText text={t('contact.xpNote')} />
          </p>
        </div>
        <nav className="contact-actions" aria-label={t('contact.actions')}>
          {primaryContactLinks.map((link) => (
            <ContactLink key={link.id} link={link} />
          ))}
        </nav>
      </div>
    </article>
  )
}
