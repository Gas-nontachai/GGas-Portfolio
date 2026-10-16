import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { BookOpenCheck, Lightbulb, PanelsTopLeft, ServerCog } from 'lucide-react'
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

function EvolutionCard({
  number,
  title,
  theme,
  illustration: Illustration,
  children,
}: {
  number: string
  title: string
  theme: 'yellow' | 'blue' | 'green' | 'pink'
  illustration: LucideIcon
  children: ReactNode
}) {
  return (
    <article className={`health-evolution-card health-evolution-card--${theme}`}>
      <h3>
        <span className="health-evolution-number">{number}</span>
        <span className="health-evolution-title">
          <ScrambleText text={title} />
        </span>
      </h3>
      <div className="health-evolution-body">
        <div className="health-evolution-copy">{children}</div>
        <span className="health-evolution-art" aria-hidden="true">
          <Illustration strokeWidth={1.8} />
        </span>
      </div>
    </article>
  )
}

export default function HealthNotebookContent({ item, side, label, spread }: Props) {
  const { t } = useTranslation()
  const prefix = 'creations.items.health.notebook'

  if (spread === 'story') {
    if (side === 'left')
      return (
        <div className="health-story-page">
          <EpisodeLabel
            text={`${t('creations.project')} ${label} / ${t('creations.categories.health')}`}
          />
          <h2>
            <ScrambleText text={t(item.titleKey)} />
          </h2>
          <p className="health-notebook-subtitle">
            <ScrambleText text={t(`${prefix}.story.subtitle`)} />
          </p>
          {item.artwork.kind === 'image' && (
            <PhotoFrame
              className="health-story-photo"
              src={item.artwork.src}
              alt={t('creations.illustration')}
              caption={t(`${prefix}.story.artCaption`)}
              rotation={-2}
            />
          )}
          <div className="health-story-copy">
            {[0, 1].map((index) => (
              <p key={index}>
                <ScrambleText text={t(`${prefix}.story.origin.${index}`)} />
              </p>
            ))}
          </div>
          <Tags text={t(`${prefix}.story.tag`)} />
        </div>
      )

    return (
      <div className="health-story-page health-story-page--idea">
        <EpisodeLabel text={t(`${prefix}.story.rightLabel`)} />
        <h2 className="health-highlight-title">
          <ScrambleText text={t(`${prefix}.story.heading`)} />
        </h2>
        <div className="health-story-copy">
          {[0, 1].map((index) => (
            <p key={index}>
              <ScrambleText text={t(`${prefix}.story.idea.${index}`)} />
            </p>
          ))}
        </div>
        <div className="health-memory-wrap">
          <MemoryNote title={t(`${prefix}.story.noteTitle`)}>
            <p>
              <ScrambleText text={t(`${prefix}.story.note`)} />
            </p>
          </MemoryNote>
          <Sticker kind="heart" className="health-memory-heart" />
        </div>
        {item.links?.live && (
          <a className="health-live-link" href={item.links.live} target="_blank" rel="noreferrer">
            <ScrambleText text={`${t('creations.live')} ↗`} />
          </a>
        )}
      </div>
    )
  }

  const cards =
    side === 'left' ? (['prototype', 'frontend'] as const) : (['backend', 'learning'] as const)

  return (
    <div className="health-evolution-page">
      {side === 'left' && (
        <>
          <EpisodeLabel text={t(`${prefix}.evolution.label`)} />
          <h2 className="health-highlight-title">
            <ScrambleText text={t(`${prefix}.evolution.title`)} />
          </h2>
          <p className="health-notebook-subtitle">
            <ScrambleText text={t(`${prefix}.evolution.subtitle`)} />
          </p>
        </>
      )}
      <div className="health-evolution-grid">
        {cards.map((card, index) => {
          const number = String((side === 'left' ? 0 : 2) + index + 1).padStart(2, '0')
          const title = t(`${prefix}.evolution.cards.${card}.title`)

          if (card === 'learning')
            return (
              <EvolutionCard
                key={card}
                number={number}
                title={title}
                theme="pink"
                illustration={BookOpenCheck}
              >
                <Highlights
                  className="health-evolution-lessons"
                  items={[0, 1].map((lesson) =>
                    t(`${prefix}.evolution.cards.learning.points.${lesson}`),
                  )}
                />
                <Takeaway label={t(`${prefix}.evolution.cards.learning.takeawayLabel`)}>
                  <ScrambleText text={t(`${prefix}.evolution.cards.learning.takeaway`)} />
                </Takeaway>
              </EvolutionCard>
            )

          const description = t(`${prefix}.evolution.cards.${card}.description`)
          const tech =
            card === 'prototype'
              ? ['Google Apps Script']
              : card === 'frontend'
                ? ['React', 'Tailwind CSS', 'React Router']
                : ['Fastify', 'Prisma', 'PostgreSQL']
          const theme = card === 'prototype' ? 'yellow' : card === 'frontend' ? 'blue' : 'green'
          const illustration =
            card === 'prototype' ? Lightbulb : card === 'frontend' ? PanelsTopLeft : ServerCog

          return (
            <EvolutionCard
              key={card}
              number={number}
              title={title}
              theme={theme}
              illustration={illustration}
            >
              <p>
                <ScrambleText text={description} />
              </p>
              <ul className="health-tech-list">
                {tech.map((name) => (
                  <TechnologyBadge key={name} name={name} />
                ))}
              </ul>
            </EvolutionCard>
          )
        })}
      </div>
    </div>
  )
}
