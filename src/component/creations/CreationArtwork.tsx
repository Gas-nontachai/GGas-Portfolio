import { Package, Wallet, CircleHelp } from 'lucide-react'
import type { CreationArtwork as Artwork } from './types'

export default function CreationArtwork({ artwork }: { artwork: Artwork }) {
  if (artwork.kind === 'image') return <img src={artwork.src} alt="" draggable={false} />
  return (
    <span className={`creation-icon creation-icon--${artwork.kind}`} aria-hidden="true">
      {artwork.kind === 'wallet' ? (
        <Wallet strokeWidth={2.5} />
      ) : (
        <>
          <Package strokeWidth={2.5} />
          <CircleHelp className="creation-question" strokeWidth={2.5} />
        </>
      )}
    </span>
  )
}
