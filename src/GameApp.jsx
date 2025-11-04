import React, { useState } from 'react';
import { useRouter } from './hooks/useRouter';
import { useGame } from './context/GameContext';

// Import all route components
import { MainMenu } from './components/UI/MainMenu';
import { SaveSlotSelection } from './components/UI/SaveSlotSelection';
import { ProfileCreation } from './components/UI/ProfileCreation';
import { BattleRoute } from './components/Routes/BattleRoute';
import { VictoryScreen } from './components/UI/VictoryScreen';
import { DefeatScreen } from './components/UI/DefeatScreen';
import { Shop } from './components/UI/Shop';
import { ProgressionMapView } from './components/Map/ProgressionMapView';
import { JokerNode } from './components/UI/JokerNode';
import { UnifiedRewardScreen } from './components/UI/UnifiedRewardScreen'; // ✅ FIXED
import { BossReward } from './components/UI/BossReward'; // ✅ FIXED
import { ActTransition } from './components/UI/ActTransitions';
import { PreBattleLoadout } from './components/UI/PreBattleLoadout';
import { BattleMenu } from './components/UI/BattleMenu';
import { Menu } from 'lucide-react';

const GameApp = () => {
  const { currentRoute } = useRouter();
  const { gameState } = useGame();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
        return <MainMenu />;
      case '/save-select':
        return <SaveSlotSelection />;
      case '/profile-creation':
        return <ProfileCreation />;
      case '/battle':
        return <BattleRoute />;
      case '/map':
        return <ProgressionMapView />;
      case '/shop':
        return <Shop />;
      case '/joker':
        return <JokerNode />;
      case '/victory':
        return <VictoryScreen />;
      case '/defeat':
        return <DefeatScreen />;
      case '/reward':
        return <UnifiedRewardScreen />; // ✅ FIXED
      case '/boss-reward':
        return <BossReward />; // ✅ FIXED
      case '/act-transition':
        return <ActTransition />;
      case '/pre-battle-loadout':
        return <PreBattleLoadout />;
      default:
        return <MainMenu />;
    }
  };

  // Show menu button on all routes except main menu and battle (battle has its own)
  const showMenuButton = ![
    '/',
    '/save-select',
    '/profile-creation',
    '/battle'
  ].includes(currentRoute);

  return (
    <div className="relative min-h-screen">
      {/* Menu Toggle Button - Top Right (for non-battle routes) */}
      {showMenuButton && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all hover:scale-105"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
          <span className="font-bold">Menu</span>
        </button>
      )}

      {/* Battle Menu - Global (available on all routes except main menu) */}
      {currentRoute !== '/' && currentRoute !== '/save-select' && currentRoute !== '/profile-creation' && (
        <BattleMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          gameState={gameState}
        />
      )}

      {/* Current Route */}
      {renderRoute()}
    </div>
  );
};

export default GameApp;