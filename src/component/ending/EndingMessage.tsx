import type { MouseEvent } from 'react'
import { ArrowUpLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ScrambleText from '../ScrambleText'
import { scrollToSection } from '../../utils/scrollNavigation'

export default function EndingMessage() {
  const { t } = useTranslation()
  const backToStart = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    const tween = scrollToSection('#main')
    if (!tween) return
    event.preventDefault()
    const focusHeading = () => {
      const heading = document.getElementById('intro-heading')
      if (!heading) return
      const previousTabIndex = heading.getAttribute('tabindex')
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
      heading.addEventListener(
        'blur',
        () => {
          if (previousTabIndex === null) heading.removeAttribute('tabindex')
          else heading.setAttribute('tabindex', previousTabIndex)
        },
        { once: true },
      )
    }
    if (tween.progress() === 1) focusHeading()
    else tween.eventCallback('onComplete', focusHeading)
  }
  return (
    <div className="ending-message" data-ending-message inert aria-hidden="true">
      <p className="ending-eyebrow">
        <ScrambleText text={`05 / ${t('ending.eyebrow')}`} />
      </p>
      <h2 id="ending-heading">
        <ScrambleText text={t('ending.title')} />
      </h2>
      <p className="ending-copy">
        <ScrambleText text={t('ending.description')} />
      </p>
      <a className="ending-back" href="#main" onClick={backToStart}>
        <ArrowUpLeft aria-hidden="true" size={20} />
        <ScrambleText text={t('ending.back')} />
      </a>
    </div>
  )
}
