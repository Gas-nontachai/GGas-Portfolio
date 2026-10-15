import type { ComponentType } from 'react'

export type ChapterPageProps = {
  side: 'left' | 'right'
  label: string
  navigation?: {
    entries: readonly {
      id: string
      titleKey: string
      descriptionKey: string
      spreadIndex: number
    }[]
    onSelect: (id: string) => void
    disabled: boolean
  }
}

export type NotebookSpread = {
  id: string
  Content: ComponentType<ChapterPageProps>
  titleKey: string
  descriptionKey: string
  className?: string
}
