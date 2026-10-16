import { BellRing, ListChecks, Search, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type LongDuwCardId = 'basics' | 'useful' | 'data' | 'learning'

export const longDuwEvolutionCards: readonly {
  id: LongDuwCardId
  side: 'left' | 'right'
  theme: 'blue' | 'green' | 'yellow' | 'pink'
  illustration: LucideIcon
}[] = [
  { id: 'basics', side: 'left', theme: 'blue', illustration: ListChecks },
  { id: 'useful', side: 'left', theme: 'green', illustration: Search },
  { id: 'data', side: 'right', theme: 'yellow', illustration: BellRing },
  { id: 'learning', side: 'right', theme: 'pink', illustration: Workflow },
]
