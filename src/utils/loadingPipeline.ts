import { withTimeout } from './imagePreloader.ts'

type AssetsResult = { completed: number; total: number; failed: number }

export async function preparePortfolio(
  loadContent: () => Promise<unknown>,
  loadAssets: () => Promise<AssetsResult>,
) {
  const [, assets] = await Promise.all([withTimeout(loadContent()), loadAssets()])
  if (assets.failed) throw new Error('Portfolio assets unavailable')
  return assets
}
