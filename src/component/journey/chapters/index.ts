import UniversityChapter from './UniversityChapter'
import FirstJobChapter from './FirstJobChapter'
import PresentChapter from './PresentChapter'
import FutureChapter from './FutureChapter'
import type { NotebookSpread } from './types'

// Add, remove, or reorder spreads here; the notebook derives its controls from this list.
export const notebookChapters = {
  university: [
    { id: 'university', Content: UniversityChapter, titleKey: 'journey.stages.university.notebookTitle', descriptionKey: 'journey.stages.university.degree' },
  ],
  career: [
    { id: 'first-job', Content: FirstJobChapter, titleKey: 'journey.stages.career.spreads.first.title', descriptionKey: 'journey.stages.career.spreads.first.description' },
    { id: 'present', Content: PresentChapter, titleKey: 'journey.stages.career.spreads.present.title', descriptionKey: 'journey.stages.career.spreads.present.description' },
  ],
  future: [
    { id: 'future', Content: FutureChapter, titleKey: 'journey.stages.future.notebookTitle', descriptionKey: 'journey.stages.future.description' },
  ],
} satisfies Record<string, [NotebookSpread, ...NotebookSpread[]]>

export type NotebookChapterId = keyof typeof notebookChapters
