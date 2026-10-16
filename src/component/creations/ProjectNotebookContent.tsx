import { useTranslation } from 'react-i18next'
import { ArrowUpRight } from 'lucide-react'
import type { ChapterPageProps } from '../journey/chapters/types'
import ScrambleText from '../ScrambleText'
import type { Creation } from './types'
import CreationArtwork from './CreationArtwork'

export default function ProjectNotebookContent({
  item,
  side,
  label,
}: ChapterPageProps & { item: Creation }) {
  const { t } = useTranslation()
  const notebook = item.notebook
  if (side === 'left')
    return (
      <>
        <p className="notebook-eyebrow">
          <ScrambleText text={`${t('creations.project')} ${label}`} />
        </p>
        <h2>
          <ScrambleText text={t(item.titleKey)} />
        </h2>
        <figure className="creation-notebook-illustration">
          <CreationArtwork artwork={item.artwork} />
        </figure>
        <p className="notebook-lead">
          <ScrambleText text={t(notebook?.overviewKey ?? item.summaryKey)} />
        </p>
        {notebook?.whyKey && (
          <>
            <h3>
              <ScrambleText text={t('creations.why')} />
            </h3>
            <p>
              <ScrambleText text={t(notebook.whyKey)} />
            </p>
          </>
        )}
        {notebook?.screenshots?.map((image) => (
          <img
            key={image.src}
            className="creation-project-screenshot"
            loading="lazy"
            src={image.src}
            alt={t(image.altKey)}
          />
        ))}
      </>
    )
  return (
    <>
      <p className="notebook-eyebrow">
        <ScrambleText text={`${t(item.categoryKey)} / ${t(`creations.status.${item.status}`)}`} />
      </p>
      <h2>
        <ScrambleText text={t('creations.details')} />
      </h2>
      {notebook?.featureKeys?.length ? (
        <>
          <h3>
            <ScrambleText text={t('creations.features')} />
          </h3>
          <ul className="creation-feature-list">
            {notebook.featureKeys.map((key) => (
              <li key={key}>
                <ScrambleText text={t(key)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          <ScrambleText text={t(item.summaryKey)} />
        </p>
      )}
      {notebook?.tech?.length && (
        <>
          <h3>
            <ScrambleText text={t('creations.tools')} />
          </h3>
          <ul className="creation-tech-list">
            {notebook.tech.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </>
      )}
      {notebook?.learningKeys?.length && (
        <>
          <h3>
            <ScrambleText text={t('creations.learnings')} />
          </h3>
          {notebook.learningKeys.map((key) => (
            <p key={key}>
              <ScrambleText text={t(key)} />
            </p>
          ))}
        </>
      )}
      {(item.links?.live || item.links?.github) && (
        <div className="creation-project-links">
          {item.links?.live && (
            <a href={item.links.live} target="_blank" rel="noopener noreferrer">
              <ScrambleText text={`${t('creations.live')} ↗`} />
            </a>
          )}
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
      )}
    </>
  )
}
