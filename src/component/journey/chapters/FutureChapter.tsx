import { useTranslation } from 'react-i18next'
import ScrambleText from '../../ScrambleText'
import photo from '../../../assets/journey_timeline/direction_sign.png'
import { EpisodeLabel, Highlights, MemoryNote, PhotoFrame, Sticker, Tags, Takeaway } from '../widgets/NotebookWidgets'
import type { ChapterPageProps } from './types'

export default function FutureChapter({ side, label }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.future'

  if (side === 'left') return <>
    <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.title`)}`} />
    <h2><ScrambleText text={t(`${prefix}.title`)} /></h2>
    <p className="notebook-lead"><ScrambleText text={t(`${prefix}.description`)} /></p>
    <PhotoFrame src={photo} alt={t('journey.notebook.images.future')} caption={t(`${prefix}.period`)} />
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
