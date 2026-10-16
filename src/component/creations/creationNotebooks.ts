import { createElement } from 'react'
import type { ChapterPageProps, NotebookSpread } from '../journey/chapters/types'
import { creations } from './creations.config'
import { canOpenNotebook } from './inventoryState'
import ProjectNotebookContent from './ProjectNotebookContent'

export const creationNotebooks = new Map(
  creations.filter(canOpenNotebook).map((item) => [
    item.id,
    [
      {
        id: item.id,
        titleKey: item.titleKey,
        descriptionKey: item.summaryKey,
        Content: (props: ChapterPageProps) =>
          createElement(ProjectNotebookContent, { ...props, item }),
      },
    ] satisfies NotebookSpread[],
  ]),
)
