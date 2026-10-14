import type { ComponentType } from 'react'

export type ChapterPageProps = {
  side: 'left' | 'right'
  label: string
}

export type NotebookSpread = {
  id: string
  Content: ComponentType<ChapterPageProps>
  titleKey: string
  descriptionKey: string
  className?: string
}
