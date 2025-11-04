import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GameApp from './GameApp.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { Router } from './hooks/useRouter.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <GameProvider>
        <Router>
          <GameApp />
        </Router>
      </GameProvider>
    </SettingsProvider>
  </StrictMode>,
)