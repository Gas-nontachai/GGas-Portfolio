import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import AssetGate from './component/AssetGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AssetGate>{ready => <App ready={ready} />}</AssetGate>
  </StrictMode>,
)
