import type { ComponentType } from 'react'

export type ChapterPageProps = {
  side: 'left' | 'right'
  label: string
  navigation?: {
    entries: readonly {
      id: string
      title: string
      descriptionKey: string
      spreadIndex: number
    }[]
    onSelect: (id: string) => void
    disabled: boolean
  }
}

export type NotebookSpread = ({ title: string } | { titleKey: string }) & {
  id: string
  Content: ComponentType<ChapterPageProps>
  descriptionKey: string
  className?: string
}
