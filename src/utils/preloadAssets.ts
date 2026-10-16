import { preloadImage } from './imagePreloader'
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

export type AssetProgress = { completed: number; total: number; failed: number }

export async function preloadAssets(onProgress: (progress: AssetProgress) => void) {
  const urls = [...new Set(Object.values(imageUrls))]
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
