import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import ScrambleText from '../ScrambleText'
import {
  EpisodeLabel,
  Highlights,
  MemoryNote,
  PhotoFrame,
  Sticker,
  Tags,
  Takeaway,
} from '../journey/widgets/NotebookWidgets'
import TechnologyBadge from '../journey/widgets/TechnologyBadge'
import type { ChapterPageProps } from '../journey/chapters/types'
import type { Creation } from './types'
import { longDuwEvolutionCards } from './longduwNotebookData'

type Props = ChapterPageProps & {
  item: Creation
  spread: 'story' | 'evolution'
}

type CardTheme = 'blue' | 'green' | 'yellow' | 'pink'

function EvolutionCard({
  number,
  title,
  theme,
  illustration: Illustration,
  children,
}: {
  number: string
  title: string
  theme: CardTheme
  illustration: LucideIcon
  children: ReactNode
}) {
  return (
    <article className={`longduw-evolution-card longduw-evolution-card--${theme}`}>
      <h3>
        <span className="longduw-evolution-number">{number}</span>
        <span className="longduw-evolution-title">
          <ScrambleText text={title} />
        </span>
      </h3>
      <div className="longduw-evolution-body">
        <div className="longduw-evolution-copy">{children}</div>
        <span className="longduw-evolution-art" aria-hidden="true">
          <Illustration strokeWidth={1.8} />
        </span>
      </div>
    </article>
  )
}

export default function LongDuwNotebookContent({ item, side, label, spread }: Props) {
  const { t } = useTranslation()
  const prefix = 'creations.items.longduw.notebook'

  if (spread === 'story') {
    if (side === 'left')
      return (
        <div className="longduw-story-page">
          <EpisodeLabel
            text={`${t('creations.project')} ${label} / ${t('creations.categories.productivity')}`}
          />
          <h2 className="longduw-highlight-title">
            <ScrambleText text={t(item.titleKey)} />
          </h2>
          <p className="longduw-notebook-subtitle">
            <ScrambleText text={t(`${prefix}.story.subtitle`)} />
          </p>
          {item.artwork.kind === 'image' && (
            <PhotoFrame
              className="longduw-story-photo"
              src={item.artwork.src}
              alt={t('creations.illustration')}
              caption={t(`${prefix}.story.artCaption`)}
              rotation={-2}
            />
          )}
          <div className="longduw-story-copy">
            {[0, 1].map((index) => (
              <p key={index}>
                <ScrambleText text={t(`${prefix}.story.origin.${index}`)} />
              </p>
            ))}
          </div>
        </div>
      )

    return (
      <div className="longduw-story-page longduw-story-page--idea">
        <EpisodeLabel text={t(`${prefix}.story.rightLabel`)} />
        <h2 className="longduw-highlight-title">
          <ScrambleText text={t(`${prefix}.story.heading`)} />
        </h2>
        <div className="longduw-story-copy">
          {[0, 1].map((index) => (
            <p key={index}>
              <ScrambleText text={t(`${prefix}.story.idea.${index}`)} />
            </p>
          ))}
        </div>
        <div className="longduw-memory-wrap">
          <MemoryNote title={t(`${prefix}.story.noteTitle`)}>
            <p>
              <ScrambleText text={t(`${prefix}.story.note`)} />
            </p>
          </MemoryNote>
          <Sticker kind="heart" className="longduw-memory-heart" />
        </div>
        <Tags
          className="longduw-story-tags"
          text={(t(`${prefix}.story.tags`, { returnObjects: true }) as string[]).join(' / ')}
        />
      </div>
    )
  }

  const cards = longDuwEvolutionCards.filter((card) => card.side === side)

  return (
    <div className="longduw-evolution-page">
      {side === 'left' && (
        <>
          <EpisodeLabel text={t(`${prefix}.evolution.label`)} />
          <h2 className="longduw-highlight-title">
            <ScrambleText text={t(`${prefix}.evolution.title`)} />
          </h2>
          <p className="longduw-notebook-subtitle">
            <ScrambleText text={t(`${prefix}.evolution.subtitle`)} />
          </p>
        </>
      )}
      <div className="longduw-evolution-grid">
        {cards.map((card, index) => {
          const cardPrefix = `${prefix}.evolution.cards.${card.id}`
          const number = String((side === 'left' ? 0 : 2) + index + 1).padStart(2, '0')
          const title = t(`${cardPrefix}.title`)
          const tags = (key: string) =>
            t(`${cardPrefix}.${key}`, { returnObjects: true }) as string[]

          return (
            <EvolutionCard
              key={card.id}
              number={number}
              title={title}
              theme={card.theme}
              illustration={card.illustration}
            >
              <p>
                <ScrambleText text={t(`${cardPrefix}.description`)} />
              </p>
              {card.id === 'basics' || card.id === 'data' ? (
                <ul className="health-tech-list">
                  {tags('tech').map((name) => (
                    <TechnologyBadge key={name} name={name} />
                  ))}
                </ul>
              ) : card.id === 'useful' ? (
                <Tags text={tags('features').join(' / ')} />
              ) : (
                <>
                  <Highlights items={tags('points')} />
                  <Takeaway label={t(`${cardPrefix}.takeawayLabel`)}>
                    <ScrambleText text={t(`${cardPrefix}.takeaway`)} />
                  </Takeaway>
                </>
              )}
              {card.id === 'data' && (
                <div className="longduw-planned-wrap">
                  <EpisodeLabel
                    className="longduw-planned-label"
                    text={t(`${cardPrefix}.plannedLabel`)}
                  />
                  <Tags className="longduw-planned-items" text={tags('planned').join(' / ')} />
                </div>
              )}
            </EvolutionCard>
          )
        })}
      </div>
    </div>
  )
}
