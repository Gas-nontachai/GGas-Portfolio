import { useMemo } from 'react'
import { Flip } from 'gsap/Flip'
import Notebook from '../notebook/Notebook'
import { notebookChapters, type NotebookChapterId } from './chapters'

export type NotebookSelection = {
  id: NotebookChapterId
  label: string
  color: string
  image: string | null
  source: HTMLButtonElement
  initialRect: DOMRect
  initialState: ReturnType<typeof Flip.getState>
}

type Props = { selection: NotebookSelection; onExited: () => void }

export default function JourneyNotebook({ selection, onExited }: Props) {
  const shared = useMemo(
    () => ({
      ...selection,
      flipId: `journey-card-${selection.id}`,
      filterSource:
        selection.source.closest<HTMLElement>('.journey-milestone-visual') ?? selection.source,
      cover: {
        eyebrowKey: 'journey.chapter',
        titleKey: `journey.stages.${selection.id}.title`,
        descriptionKey: `journey.stages.${selection.id}.shortDescription`,
        label: 'JOURNEY / NOTES',
      },
    }),
    [selection],
  )
  return (
    <Notebook selection={shared} spreads={notebookChapters[selection.id]} onExited={onExited} />
  )
}
