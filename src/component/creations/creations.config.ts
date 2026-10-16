import healthSaasIcon from '../../assets/icon-app/health-saas-icon.png'
import longduwLogo from '../../assets/icon-app/longduw-logo.webp'
import ngenBillsIcon from '../../assets/icon-app/ngenbills-icon.png'
import type { Creation } from './types'

export const inventoryConfig = {
  minimumSlots: 12,
  columns: { desktop: 4, tablet: 3, mobile: 3 },
} as const

export const creations: readonly Creation[] = [
  {
    id: 'health',
    status: 'wip',
    categoryKey: 'creations.categories.health',
    titleKey: 'creations.items.health.title',
    summaryKey: 'creations.items.health.summary',
    color: '#ff80ab',
    artwork: { kind: 'image', src: healthSaasIcon },
    links: { live: 'https://health-saas-one.vercel.app/' },
  },
  {
    id: 'longduw',
    status: 'wip',
    categoryKey: 'creations.categories.productivity',
    titleKey: 'creations.items.longduw.title',
    summaryKey: 'creations.items.longduw.summary',
    color: '#68a4ff',
    artwork: { kind: 'image', src: longduwLogo },
    notebook: { tech: ['Flutter'] },
  },
  {
    id: 'ngenbills',
    status: 'wip',
    categoryKey: 'creations.categories.finance',
    titleKey: 'creations.items.ngenbills.title',
    summaryKey: 'creations.items.ngenbills.summary',
    color: '#b9d5b5',
    artwork: { kind: 'image', src: ngenBillsIcon },
    // Verified against the project's README; screenshots and personal motivation are not supplied.
    notebook: {
      overviewKey: 'creations.items.ngenbills.overview',
      featureKeys: [
        'creations.items.ngenbills.features.0',
        'creations.items.ngenbills.features.1',
        'creations.items.ngenbills.features.2',
      ],
      tech: ['Flutter', 'SQLite', 'Riverpod'],
    },
    links: { github: 'https://github.com/Gas-nontachai/NgenBills' },
  },
  ...Array.from({ length: 3 }, (_, index): Creation => ({
    id: `mystery-${index + 1}`,
    status: 'mystery',
    categoryKey: 'creations.categories.idea',
    titleKey: 'creations.items.mystery.title',
    summaryKey: 'creations.items.mystery.summary',
    color: '#ffe16b',
    artwork: { kind: 'mystery' },
  })),
]
