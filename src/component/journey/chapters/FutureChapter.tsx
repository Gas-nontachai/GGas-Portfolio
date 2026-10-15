import { useTranslation } from 'react-i18next'
import ScrambleText from '../../ScrambleText'
import photo from '../../../assets/journey_timeline/direction_sign.png'
import { EpisodeLabel, Sticker } from '../widgets/NotebookWidgets'
import type { ChapterPageProps } from './types'

export default function FutureChapter({ side, label }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.future'

  if (side === 'left')
    return (
      <>
        <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.period`)}`} />
        <div className="notebook-future-question">
          <span className="notebook-question-mark" aria-hidden="true">
            ?
          </span>
          <h2>
            <ScrambleText text={t(`${prefix}.notebookTitle`)} />
          </h2>
          <p className="notebook-future-prompt">
            <ScrambleText text={t(`${prefix}.description`)} />
          </p>
          <p>
            <ScrambleText text={t(`${prefix}.story`)} />
          </p>
        </div>
      </>
    )

  return (
    <>
      <div className="notebook-future-blank">
        <Sticker kind="paperclip" className="notebook-paperclip" />
        <h3>
          <ScrambleText text={t(`${prefix}.blankTitle`)} />
        </h3>
        <p>
          <ScrambleText text={t(`${prefix}.memory`)} />
        </p>
        <div className="notebook-unwritten-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <img
          src={photo}
          className="notebook-future-sign-sticker"
          alt={t('journey.notebook.images.future')}
        />
        <p className="notebook-future-signoff">
          <ScrambleText text={t(`${prefix}.takeaway`)} />
        </p>
      </div>
    </>
  )
}
