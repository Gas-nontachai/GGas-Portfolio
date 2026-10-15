import UniversityChapter from './UniversityChapter'
import { FirstJobSpread, SustainabilitySpread, AppsFlyerSpread } from './CareerChapter'
import FutureChapter from './FutureChapter'
import type { NotebookSpread } from './types'
import { careerProjectTitles } from '../../../config/journey'

// Add, remove, or reorder spreads here; the notebook derives its controls from this list.
export const notebookChapters = {
  university: [
    {
      id: 'university',
      Content: UniversityChapter,
      titleKey: 'journey.stages.university.notebookTitle',
      descriptionKey: 'journey.stages.university.degree',
    },
  ],
  career: [
    {
      id: 'first-job',
      Content: FirstJobSpread,
      titleKey: 'journey.stages.career.spreads.first.title',
      descriptionKey: 'journey.stages.career.spreads.first.description',
    },
    {
      id: 'sustainability',
      Content: SustainabilitySpread,
      title: careerProjectTitles.sustainability,
      descriptionKey: 'journey.stages.career.spreads.sustainability.description',
      className: 'sustainability-notebook',
    },
    {
      id: 'app-flyer',
      Content: AppsFlyerSpread,
      title: careerProjectTitles.flyer,
      descriptionKey: 'journey.stages.career.spreads.flyer.description',
    },
  ],
  future: [
    {
      id: 'future',
      Content: FutureChapter,
      titleKey: 'journey.stages.future.notebookTitle',
      descriptionKey: 'journey.stages.future.description',
    },
  ],
} satisfies Record<string, [NotebookSpread, ...NotebookSpread[]]>

export type NotebookChapterId = keyof typeof notebookChapters
