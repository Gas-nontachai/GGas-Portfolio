import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { ArrowUpRight, ChartPie, Database, Heart, WalletCards } from 'lucide-react'
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

type Props = ChapterPageProps & {
  item: Creation
  spread: 'story' | 'evolution'
}

type CardTheme = 'blue' | 'green' | 'yellow' | 'pink'

const evolutionCards = [
  { id: 'accounts', side: 'left', theme: 'blue', illustration: WalletCards },
  { id: 'progress', side: 'left', theme: 'green', illustration: ChartPie },
  { id: 'architecture', side: 'right', theme: 'yellow', illustration: Database },
  { id: 'learning', side: 'right', theme: 'pink', illustration: Heart },
] as const

const techStack = ['Flutter', 'Dart', 'SQLite', 'Riverpod']
const storyTags = ['Personal Finance', 'Debt Tracker']

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
    <article className={`ngenbills-evolution-card ngenbills-evolution-card--${theme}`}>
      <h3>
        <span className="ngenbills-evolution-number">{number}</span>
        <span className="ngenbills-evolution-title">
          <ScrambleText text={title} />
        </span>
      </h3>
      <div className="ngenbills-evolution-body">
        <div className="ngenbills-evolution-copy">{children}</div>
        <span className="ngenbills-evolution-art" aria-hidden="true">
          <Illustration strokeWidth={1.8} />
        </span>
      </div>
    </article>
  )
}

export default function NgenBillsNotebookContent({ item, side, label, spread }: Props) {
  const { t } = useTranslation()
  const prefix = 'creations.items.ngenbills.notebook'

  if (spread === 'story') {
    if (side === 'left')
      return (
        <div className="ngenbills-story-page">
          <EpisodeLabel
            text={`${t('creations.project')} ${label} / ${t('creations.categories.finance')}`}
          />
          <h2 className="ngenbills-highlight-title">
            <ScrambleText text={t(item.titleKey)} />
          </h2>
          <p className="ngenbills-notebook-subtitle">
            <ScrambleText text={t(`${prefix}.story.subtitle`)} />
          </p>
          {item.artwork.kind === 'image' && (
            <PhotoFrame
              className="ngenbills-story-photo"
              src={item.artwork.src}
              alt={t('creations.illustration')}
              caption={t(`${prefix}.story.artCaption`)}
              rotation={-2}
            />
          )}
          <div className="ngenbills-story-copy">
            {(t(`${prefix}.story.origin`, { returnObjects: true }) as string[]).map((paragraph) => (
              <p key={paragraph}>
                <ScrambleText text={paragraph} />
              </p>
            ))}
          </div>
          <Tags className="ngenbills-story-tags" text={storyTags.join(' / ')} />
        </div>
      )

    return (
      <div className="ngenbills-story-page ngenbills-story-page--why">
        <EpisodeLabel text={t(`${prefix}.story.rightLabel`)} />
        <h2 className="ngenbills-highlight-title">
          <ScrambleText text={t(`${prefix}.story.heading`)} />
        </h2>
        <div className="ngenbills-story-copy">
          {(t(`${prefix}.story.why`, { returnObjects: true }) as string[]).map((paragraph) => (
            <p key={paragraph}>
              <ScrambleText text={paragraph} />
            </p>
          ))}
        </div>
        <div className="ngenbills-memory-wrap">
          <MemoryNote title={t(`${prefix}.story.noteTitle`)}>
            <p>
              <ScrambleText text={t(`${prefix}.story.note`)} />
            </p>
          </MemoryNote>
          <Sticker kind="heart" className="ngenbills-memory-sticker" />
        </div>
        <Tags className="ngenbills-story-tags" text={storyTags.join(' / ')} />
        {item.links?.github && (
          <a
            className="creation-source-link"
            href={item.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ScrambleText text={t('creations.github')} />
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        )}
      </div>
    )
  }

  const cards = evolutionCards.filter((card) => card.side === side)

  return (
    <div className="ngenbills-evolution-page">
      {side === 'left' && (
        <>
          <EpisodeLabel text={t(`${prefix}.evolution.label`)} />
          <h2 className="ngenbills-highlight-title">
            <ScrambleText text={t(`${prefix}.evolution.title`)} />
          </h2>
          <p className="ngenbills-notebook-subtitle">
            <ScrambleText text={t(`${prefix}.evolution.subtitle`)} />
          </p>
        </>
      )}
      <div className="ngenbills-evolution-grid">
        {cards.map((card, index) => {
          const cardPrefix = `${prefix}.evolution.cards.${card.id}`
          const number = String((side === 'left' ? 0 : 2) + index + 1).padStart(2, '0')
          const title = t(`${cardPrefix}.title`)

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
              {card.id === 'accounts' || card.id === 'progress' ? (
                <Highlights
                  items={t(`${cardPrefix}.points`, { returnObjects: true }) as string[]}
                />
              ) : card.id === 'architecture' ? (
                <ul className="health-tech-list">
                  {techStack.map((name) => (
                    <TechnologyBadge key={name} name={name} />
                  ))}
                </ul>
              ) : (
                <Takeaway label={t(`${cardPrefix}.takeawayLabel`)}>
                  <ScrambleText text={t(`${cardPrefix}.takeaway`)} />
                </Takeaway>
              )}
            </EvolutionCard>
          )
        })}
      </div>
    </div>
  )
}
