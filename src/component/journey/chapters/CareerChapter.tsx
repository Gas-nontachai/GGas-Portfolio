import { useTranslation } from 'react-i18next'
import ScrambleText from '../../ScrambleText'
import teamPhoto from '../../../assets/journey_timeline/img/tcc-team-photobooth.jpg'
import partyPhoto from '../../../assets/journey_timeline/img/tcc-staff-party.jpg'
import TechnologyBadge from '../widgets/TechnologyBadge'
import type { ChapterPageProps } from './types'
import { EpisodeLabel, PhotoFrame, Sticker } from '../widgets/NotebookWidgets'
import SustainabilityProject from './SustainabilityProject'

type CareerTopic = { title: string; description: string; stack: string[] }

function StackTags({ items }: { items: string[] }) {
  return <ul className="sustainability-tech-list">{items.map(item => <TechnologyBadge key={item} name={item} />)}</ul>
}

function WorkTopics({ items, compact = false }: { items: CareerTopic[]; compact?: boolean }) {
  return <div className={`notebook-career-topics${compact ? ' notebook-career-topics-compact' : ''}`}>{items.map((item, index) => <article className="notebook-career-topic" key={index}>
    <h3><ScrambleText text={item.title} /></h3>
    <p><ScrambleText text={item.description} /></p>
    <StackTags items={item.stack} />
  </article>)}</div>
}

export function FirstJobSpread({ side, label, navigation }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.career.spreads.first'

  if (side === 'left') return <>
    <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.title`)}`} />
    <h2 className="notebook-first-company"><ScrambleText text={t(`${prefix}.company`)} /></h2>
    <p className="notebook-lead"><ScrambleText text={t(`${prefix}.role`)} />
      <ScrambleText text={t(`${prefix}.story`)} />
    </p>
    <div className="notebook-first-photos">
      <PhotoFrame src={partyPhoto} alt={t(`${prefix}.photos.party.alt`)} caption={t(`${prefix}.photos.party.caption`)} variant="polaroid" rotation={-6} />
      <PhotoFrame src={teamPhoto} alt={t(`${prefix}.photos.team.alt`)} caption={t(`${prefix}.photos.team.caption`)} variant="polaroid" rotation={5} />
    </div>
  </>

  return <>
    <EpisodeLabel text={t(`${prefix}.period`)} />
    <h2 className="notebook-career-heading"><ScrambleText text={t(`${prefix}.contents.title`)} /></h2>
    <nav aria-label={t(`${prefix}.contents.title`)}>
      <ol className="notebook-project-contents">
        {navigation?.entries.filter(entry => entry.spreadIndex > 0).map(entry => <li key={entry.id}>
          <button type="button" disabled={navigation.disabled} onClick={() => navigation.onSelect(entry.id)}>
            <span className="notebook-contents-meta"><span><ScrambleText text={t(`${prefix}.contents.project`, { number: String(entry.spreadIndex).padStart(2, '0') })} /></span><span>{String(entry.spreadIndex * 2 + 1).padStart(2, '0')}–{String(entry.spreadIndex * 2 + 2).padStart(2, '0')}</span></span>
            <span className="notebook-contents-title"><ScrambleText text={t(entry.titleKey)} /><span aria-hidden="true">↗</span></span>
            <span className="notebook-contents-description"><ScrambleText text={t(entry.descriptionKey)} /></span>
          </button>
        </li>)}
      </ol>
    </nav>
    <p className="notebook-contents-hint"><ScrambleText text={t(`${prefix}.contents.hint`)} /></p>
    <Sticker kind="bookmark" className="notebook-bookmark" />
  </>
}

export function SustainabilitySpread({ side, label }: ChapterPageProps) {
  return <SustainabilityProject side={side} label={label} />
}

export function AppsflyerSpread({ side, label }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.career.spreads.flyer'

  if (side === 'left') return <>
    <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.category`)}`} />
    <h2><ScrambleText text={t(`${prefix}.title`)} /></h2>
    <p className="notebook-lead"><ScrambleText text={t(`${prefix}.description`)} /></p>
    <div className="notebook-flyer-flow">
      <span className="notebook-flyer-source">Oishi Club</span>
      <span aria-hidden="true" className="notebook-flyer-arrow">↓</span>
      <div className="notebook-flyer-app"><span>Appsflyer</span><p><ScrambleText text={t(`${prefix}.purpose`)} /></p></div>
      <span aria-hidden="true" className="notebook-flyer-arrow">↓</span>
      <span className="notebook-flyer-destination">Connect X</span>
    </div>
    <Sticker kind="star" className="notebook-career-star" />
  </>

  return <>
    <EpisodeLabel text={t(`${prefix}.stackLabel`)} />
    <h2 className="notebook-career-heading"><ScrambleText text={t(`${prefix}.stackTitle`)} /></h2>
    <WorkTopics items={t(`${prefix}.workTopics`, { returnObjects: true }) as CareerTopic[]} />
    <p className="notebook-flyer-note"><ScrambleText text={t(`${prefix}.summary`)} /></p>
    <Sticker kind="heart" className="notebook-career-heart" />
  </>
}
