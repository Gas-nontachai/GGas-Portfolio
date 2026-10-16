export type CreationStatus = 'completed' | 'wip' | 'mystery'
export type CreationArtwork = { kind: 'image'; src: string } | { kind: 'wallet' | 'mystery' }
export type Creation = {
  id: string
  status: CreationStatus
  categoryKey: string
  titleKey: string
  summaryKey: string
  color: string
  artwork: CreationArtwork
  notebook?: {
    overviewKey?: string
    whyKey?: string
    featureKeys?: readonly string[]
    tech?: readonly string[]
    learningKeys?: readonly string[]
    screenshots?: readonly { src: string; altKey: string }[]
  }
  links?: { live?: string; github?: string }
}
