import { useTranslation } from 'react-i18next'
import { socialContactLinks } from '../../data/contactLinks'

const drawings = {
  facebook: (
    <path
      fill="currentColor"
      stroke="none"
      d="M14 21v-8h3l.5-3H14V8.2c0-.9.3-1.5 1.6-1.5h2V4.1C17.2 4 16 4 15 4c-2.6 0-4.2 1.6-4.2 4.4V10H8v3h2.8v8Z"
    />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: <path d="M14 3v12.5a4.5 4.5 0 1 1-4.5-4.5M14 3c.5 3 2.5 5 6 5" />,
  line: (
    <>
      <path d="M21 10.5c0-4.1-4-7.5-9-7.5S3 6.4 3 10.5c0 3.8 3.3 6.9 7.6 7.4l-.5 3.1c4.1-2.2 10.9-5.7 10.9-10.5Z" />
      <text
        x="12"
        y="12.7"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="5.8"
        fontWeight="800"
      >
        LINE
      </text>
    </>
  ),
}

export default function SocialLinks() {
  const { t } = useTranslation()
  return (
    <nav className="contact-socials" aria-label={t('contact.links')}>
      {socialContactLinks.map((link) => (
        <a
          key={link.id}
          className="contact-social-link"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          aria-label={`${link.label} (${t('contact.newTab')})`}
        >
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {drawings[link.id]}
          </svg>
        </a>
      ))}
    </nav>
  )
}
