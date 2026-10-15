import { useTranslation } from 'react-i18next'
import {
  Blocks,
  ClipboardCheck,
  KeyRound,
  ListFilter,
  MousePointer2,
  PanelsTopLeft,
  ServerCog,
  UserRound,
} from 'lucide-react'
import ScrambleText from '../../ScrambleText'
import TechnologyBadge from '../widgets/TechnologyBadge'
import { EpisodeLabel } from '../widgets/NotebookWidgets'
import type { ChapterPageProps } from './types'
import { careerProjectTitles } from '../../../config/journey'
import office from '../../../assets/journey_timeline/office_building.png'
import tree from '../../../assets/journey_timeline/tree_round.png'
import tape from '../../../assets/journey-notebook-asset-pack/svg/07-paper-tape-blue.svg'
import './sustainability.css'

type Topic = { title: string; description: string; stack: string[] }
const frontendTopics = [
  { title: 'Micro-Frontends', stack: ['React', 'TypeScript', 'Webpack'] },
  { title: 'Sustaina SharedUI', stack: ['React', 'Tailwind CSS', 'npm'] },
  { title: 'State, Query and Integration', stack: ['Zustand', 'TanStack Query', 'TypeScript'] },
]
const backendTopics = [
  { title: 'Backend, MicroService', stack: ['Node.js', 'Fastify', 'Prisma', 'Kafka'] },
  {
    title: 'Authenticate & Permission',
    stack: ['Fastify', 'Prisma', 'Authentication', 'Authorization'],
  },
  {
    title: 'Testing and QA handoff',
    stack: ['Unit testing', 'Agile Scrum', 'Git', 'AI-assisted development'],
  },
]
const illustrations = [PanelsTopLeft, Blocks, ListFilter, ServerCog, UserRound, ClipboardCheck]

function IllustratedTopics({ topics, start }: { topics: Topic[]; start: number }) {
  return (
    <div className="sustainability-topics">
      {topics.map((topic, index) => {
        const Illustration = illustrations[start + index]
        return (
          <article key={index} className={`sustainability-topic sustainability-topic-${index}`}>
            <img src={tape} alt="" aria-hidden="true" className="sustainability-card-tape" />
            <header>
              <span className="sustainability-topic-number">
                {String(start + index + 1).padStart(2, '0')}
              </span>
              <h3>
                <ScrambleText text={topic.title} />
              </h3>
            </header>
            <p>
              <ScrambleText text={topic.description} />
            </p>
            <span
              className={`sustainability-topic-art sustainability-art-${start + index}`}
              aria-hidden="true"
            >
              <Illustration className="sustainability-main-icon" />
              {start + index === 2 && <MousePointer2 className="sustainability-detail-icon" />}
              {start + index === 4 && <KeyRound className="sustainability-detail-icon" />}
            </span>
            <ul className="sustainability-tech-list">
              {topic.stack.map((name) => (
                <TechnologyBadge key={name} name={name} />
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}

export default function SustainabilityProject({ side, label }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.career.spreads.sustainability'

  if (side === 'left')
    return (
      <>
        <header className="sustainability-intro mb-4">
          <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.category`)}`} />
          <h2>
            <ScrambleText text={careerProjectTitles.sustainability} />
          </h2>
          <div className="sustainability-snapshot z-999" aria-hidden="true">
            <img className="sustainability-snapshot-tree" src={tree} alt="" />
            <img className="sustainability-snapshot-office" src={office} alt="" />
            <img className="sustainability-snapshot-tape" src={tape} alt="" />
          </div>
        </header>
        <EpisodeLabel
          className="sustainability-backend-label"
          text={t(`${prefix}.frontendLabel`)}
        />
        <IllustratedTopics
          topics={frontendTopics.map((topic, index) => ({
            ...topic,
            description: t(`${prefix}.frontendTopics.${index}.description`),
          }))}
          start={0}
        />
      </>
    )

  return (
    <>
      <EpisodeLabel className="sustainability-backend-label" text={t(`${prefix}.backendLabel`)} />
      <IllustratedTopics
        topics={backendTopics.map((topic, index) => ({
          ...topic,
          description: t(`${prefix}.backendTopics.${index}.description`),
        }))}
        start={3}
      />
    </>
  )
}
