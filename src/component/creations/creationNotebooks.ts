import { createElement } from 'react'
import type { ChapterPageProps, NotebookSpread } from '../journey/chapters/types'
import { creations } from './creations.config'
import { canOpenNotebook } from './inventoryState'
import ProjectNotebookContent from './ProjectNotebookContent'
import HealthNotebookContent from './HealthNotebookContent'
import LongDuwNotebookContent from './LongDuwNotebookContent'
import NgenBillsNotebookContent from './NgenBillsNotebookContent'

export const creationNotebooks = new Map(
  creations.filter(canOpenNotebook).map((item) => [
    item.id,
    item.id === 'health'
      ? ([
          {
            id: 'health-story',
            titleKey: 'creations.items.health.notebook.story.title',
            descriptionKey: 'creations.items.health.notebook.story.subtitle',
            className: 'health-notebook',
            Content: (props: ChapterPageProps) =>
              createElement(HealthNotebookContent, { ...props, item, spread: 'story' }),
          },
          {
            id: 'health-evolution',
            titleKey: 'creations.items.health.notebook.evolution.title',
            descriptionKey: 'creations.items.health.notebook.evolution.subtitle',
            className: 'health-notebook',
            Content: (props: ChapterPageProps) =>
              createElement(HealthNotebookContent, { ...props, item, spread: 'evolution' }),
          },
        ] satisfies NotebookSpread[])
      : item.id === 'longduw'
        ? ([
            {
              id: 'longduw-story',
              titleKey: 'creations.items.longduw.notebook.story.title',
              descriptionKey: 'creations.items.longduw.notebook.story.subtitle',
              className: 'longduw-notebook',
              Content: (props: ChapterPageProps) =>
                createElement(LongDuwNotebookContent, { ...props, item, spread: 'story' }),
            },
            {
              id: 'longduw-evolution',
              titleKey: 'creations.items.longduw.notebook.evolution.title',
              descriptionKey: 'creations.items.longduw.notebook.evolution.subtitle',
              className: 'longduw-notebook',
              Content: (props: ChapterPageProps) =>
                createElement(LongDuwNotebookContent, { ...props, item, spread: 'evolution' }),
            },
          ] satisfies NotebookSpread[])
        : item.id === 'ngenbills'
          ? ([
              {
                id: 'ngenbills-story',
                titleKey: 'creations.items.ngenbills.notebook.story.title',
                descriptionKey: 'creations.items.ngenbills.notebook.story.subtitle',
                className: 'ngenbills-notebook',
                Content: (props: ChapterPageProps) =>
                  createElement(NgenBillsNotebookContent, { ...props, item, spread: 'story' }),
              },
              {
                id: 'ngenbills-evolution',
                titleKey: 'creations.items.ngenbills.notebook.evolution.title',
                descriptionKey: 'creations.items.ngenbills.notebook.evolution.subtitle',
                className: 'ngenbills-notebook',
                Content: (props: ChapterPageProps) =>
                  createElement(NgenBillsNotebookContent, { ...props, item, spread: 'evolution' }),
              },
            ] satisfies NotebookSpread[])
          : ([
              {
                id: item.id,
                titleKey: item.titleKey,
                descriptionKey: item.summaryKey,
                Content: (props: ChapterPageProps) =>
                  createElement(ProjectNotebookContent, { ...props, item }),
              },
            ] satisfies NotebookSpread[]),
  ]),
)
