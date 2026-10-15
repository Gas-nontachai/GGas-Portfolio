import { useTranslation } from 'react-i18next'
import ScrambleText from '../../ScrambleText'
import teamPhoto from '../../../assets/journey_timeline/img/tcc-team-photobooth.jpg'
import partyPhoto from '../../../assets/journey_timeline/img/tcc-staff-party.jpg'
import type { ChapterPageProps } from './types'
import flutter from '../../../assets/life-inventory/flutter-flutter-shard.png'
import esp32 from '../../../assets/life-inventory/esp32-smart-chip.png'
import printer from '../../../assets/life-inventory/3d-printer-printer-forge.png'
import { EpisodeLabel, Highlights, MemoryNote, PhotoFrame, Sticker, Tags, Takeaway } from '../widgets/NotebookWidgets'

export function FirstJobSpread({ side, label }: ChapterPageProps) {
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
    <p><ScrambleText text={t(`${prefix}.story`)} /></p>
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

export function PresentSpread({ side, label }: ChapterPageProps) {
  const { t } = useTranslation()
  const prefix = 'journey.stages.career.spreads.present'

  if (side === 'left') return <>
    <EpisodeLabel text={`${t('journey.chapter')} ${label} / ${t(`${prefix}.title`)}`} />
    <h2><ScrambleText text={t(`${prefix}.title`)} /></h2>
    <p className="notebook-lead"><ScrambleText text={t(`${prefix}.description`)} /></p>
    <div className="notebook-experiments">
      {([{ id: 'flutter', image: flutter }, { id: 'esp32', image: esp32 }, { id: 'printing', image: printer }] as const).map(({ id, image }) => <article className={`notebook-experiment notebook-experiment-${id}`} key={id}>
        <img src={image} alt="" aria-hidden="true" />
        <div><h3><ScrambleText text={t(`${prefix}.projects.${id}.title`)} /></h3><p><ScrambleText text={t(`${prefix}.projects.${id}.description`)} /></p></div>
      </article>)}
    </div>
    <Tags text={t(`${prefix}.tag`)} />
  </>

  return <>
    <EpisodeLabel text={t(`${prefix}.period`)} />
    <MemoryNote className="notebook-present-note" title={t(`${prefix}.noteTitle`)}><p><ScrambleText text={t(`${prefix}.memory`)} /></p></MemoryNote>
    <h3 className="notebook-present-heading"><ScrambleText text={t(`${prefix}.storyTitle`)} /></h3>
    <p><ScrambleText text={t(`${prefix}.story`)} /></p>
    <Takeaway label={t('journey.takeaway')}><ScrambleText text={t(`${prefix}.takeaway`)} /></Takeaway>
    <Sticker kind="star" className="notebook-present-star" />
    <Sticker kind="heart" className="notebook-present-heart" />
  </>
}
