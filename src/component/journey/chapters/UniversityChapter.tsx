import { useTranslation } from 'react-i18next'
import ScrambleText from '../../ScrambleText'
import universityPhoto from '../../../assets/journey_timeline/img/university-rmuti.png'
import { EpisodeLabel, Highlights, MemoryNote, PhotoFrame, Sticker, Tags, Takeaway } from '../widgets/NotebookWidgets'
import type { ChapterPageProps } from './types'

export default function UniversityChapter({ side, label }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.university'

  if (side === 'left') return <>
    <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.episodeTitle`)}`} />
    <h2 className="university-notebook-title"><ScrambleText text={t(`${prefix}.notebookTitle`)} /></h2>
    <p className="notebook-lead"><ScrambleText text={t(`${prefix}.degree`)} /><br /><ScrambleText text={t(`${prefix}.faculty`)} /></p>
    <PhotoFrame src={universityPhoto} alt={t('journey.notebook.images.university')} caption={t(`${prefix}.period`)} variant="polaroid" style={{ margin: '28px auto 22px' }} />
    <p><ScrambleText text={t(`${prefix}.story`)} /></p>
  </>

  return <>
    <Sticker kind="bookmark" className="notebook-bookmark" />
    <Sticker kind="paperclip" className="notebook-paperclip" />
    <Highlights title={t('journey.highlights')} items={t(`${prefix}.highlights`, { returnObjects: true }) as string[]} />
    <MemoryNote title={t('journey.notebook.memory')}><p><ScrambleText text={t(`${prefix}.memory`)} /></p></MemoryNote>
    <Takeaway label={t('journey.takeaway')}><ScrambleText text={t(`${prefix}.takeaway`)} /></Takeaway>
    <Tags text={t(`${prefix}.tag`)} />
    <Sticker kind="heart" className="notebook-heart-sticker" />
    <Sticker kind="car" className="notebook-car-sticker" />
  </>
}
