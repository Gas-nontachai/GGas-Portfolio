import reactIcon from '../assets/life-inventory/react-atom-buddy.png'
import typescriptIcon from '../assets/life-inventory/typescript-ts-block.png'
import flutterIcon from '../assets/life-inventory/flutter-flutter-shard.png'
import gamingIcon from '../assets/life-inventory/gaming-game-controller.png'
import cameraIcon from '../assets/life-inventory/webcam-camera-eye.png'
import printerIcon from '../assets/life-inventory/3d-printer-printer-forge.png'

export const overlayImageUrls = [
  reactIcon,
  typescriptIcon,
  flutterIcon,
  gamingIcon,
  cameraIcon,
  printerIcon,
]

const imageUrls = import.meta.glob<string>(
  ['../assets/**/*.{png,jpg,jpeg,webp,gif,svg}', '!../assets/current-experiments-asset-pack/**'],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)

const images = new Map<string, Promise<void>>()
let fontTask: Promise<void> | undefined

export type AssetProgress = { completed: number; total: number; failed: number }

function withTimeout(task: Promise<unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Asset loading timed out')), 60000)
    task.then(() => resolve(), reject).finally(() => window.clearTimeout(timeout))
  })
}

function preloadImage(url: string) {
  const cached = images.get(url)
  if (cached) return cached

  const image = new Image()
  const task = withTimeout(
    new Promise<void>((resolve, reject) => {
      image.onload = () => {
        image.decode().then(resolve, reject)
      }
      image.onerror = () => reject(new Error(`Unable to load ${url}`))
      image.src = url
    }),
  )
    .catch((error) => {
      images.delete(url)
      throw error
    })
    .finally(() => {
      image.onload = null
      image.onerror = null
    })
  images.set(url, task)
  return task
}

export async function preloadOverlayAssets() {
  fontTask ??= withTimeout(
    document.fonts.load('16px "iannnnn AMD"').then((fonts) => {
      if (!fonts.length) throw new Error('Portfolio font unavailable')
      return document.fonts.ready
    }),
  ).catch((error) => {
    fontTask = undefined
    throw error
  })
  await Promise.all([fontTask, ...overlayImageUrls.map(preloadImage)])
}

export async function preloadAssets(onProgress: (progress: AssetProgress) => void) {
  const urls = [...new Set(Object.values(imageUrls))].filter(
    (url) => !overlayImageUrls.includes(url),
  )
  const progress: AssetProgress = { completed: 0, total: urls.length, failed: 0 }
  onProgress({ ...progress })

  const tasks = urls.map(preloadImage)
  await Promise.all(
    tasks.map(async (task) => {
      try {
        await task
      } catch {
        progress.failed += 1
      } finally {
        progress.completed += 1
        onProgress({ ...progress })
      }
    }),
  )

  return { ...progress }
}
