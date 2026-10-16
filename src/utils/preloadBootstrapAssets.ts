import { cursorAssets } from '../config/cursors'
import { preloadImage, withTimeout } from './imagePreloader'

let fontTask: Promise<void> | undefined

export async function preloadBootstrapAssets() {
  fontTask ??= withTimeout(
    document.fonts.load('16px "iannnnn AMD"').then((fonts) => {
      if (!fonts.length) throw new Error('Portfolio font unavailable')
    }),
  ).catch((error) => {
    fontTask = undefined
    throw error
  })
  const cursors = window.matchMedia('(pointer: fine)').matches
    ? Object.values(cursorAssets).map(preloadImage)
    : []
  await Promise.all([fontTask, ...cursors])
}
