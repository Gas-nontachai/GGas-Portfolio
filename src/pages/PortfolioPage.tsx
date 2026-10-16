import { useCallback, useState, type ComponentType } from 'react'
import AssetGate from '../component/AssetGate'

export default function PortfolioPage() {
  const [App, setApp] = useState<ComponentType<{ ready?: boolean }> | null>(null)
  const prepareContent = useCallback(async () => {
    const module = await import('../App')
    setApp(() => module.default)
  }, [])
  return (
    <AssetGate prepareContent={prepareContent}>{(ready) => App && <App ready={ready} />}</AssetGate>
  )
}
