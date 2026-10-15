import { useTranslation } from 'react-i18next'
import ScrambleText from '../../ScrambleText'
import teamPhoto from '../../../assets/journey_timeline/img/tcc-team-photobooth.jpg'
import partyPhoto from '../../../assets/journey_timeline/img/tcc-staff-party.jpg'
import { EpisodeLabel, Highlights, MemoryNote, PhotoFrame, Sticker, Tags, Takeaway } from '../widgets/NotebookWidgets'
import type { ChapterPageProps } from './types'

export default function FirstJobChapter({ side, label }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.career.spreads.first'

  if (side === 'left') return <>
    <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.title`)}`} />
    <h2 className="notebook-first-company"><ScrambleText text={t(`${prefix}.company`)} /></h2>
    <p className="notebook-lead"><ScrambleText text={t(`${prefix}.role`)} /></p>
    <div className="notebook-first-photos">
      <PhotoFrame src={partyPhoto} alt={t(`${prefix}.photos.party.alt`)} caption={t(`${prefix}.photos.party.caption`)} variant="polaroid" rotation={-6} />
      <PhotoFrame src={teamPhoto} alt={t(`${prefix}.photos.team.alt`)} caption={t(`${prefix}.photos.team.caption`)} variant="polaroid" rotation={5} />
    </div>
  </>

  return <>
    <Sticker kind="bookmark" className="notebook-bookmark" />
    <Sticker kind="paperclip" className="notebook-paperclip" />
    <Highlights className="notebook-first-log" title={t(`${prefix}.logTitle`)} items={t(`${prefix}.highlights`, { returnObjects: true }) as string[]} />
    <MemoryNote title={t(`${prefix}.noteTitle`)}><p><ScrambleText text={t(`${prefix}.memory`)} /></p></MemoryNote>
    <Takeaway label={t('journey.takeaway')}><ScrambleText text={t(`${prefix}.takeaway`)} /></Takeaway>
    <Tags text={t(`${prefix}.tag`)} />
    <Sticker kind="heart" className="notebook-heart-sticker" />
    <Sticker kind="car" className="notebook-car-sticker" />
  </>
}
