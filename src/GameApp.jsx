import React from 'react';
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
import { GameMenu } from './components/UI/GameMenu';
import { Menu, X } from 'lucide-react';

const GameApp = () => {
  const { currentRoute } = useRouter();
  const { gameState, dispatch } = useGame();

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

  const handleToggleMenu = () => {
    if (gameState.menuOpen) {
      dispatch({ type: 'CLOSE_MENU' });
    } else {
      dispatch({ type: 'OPEN_MENU', tab: 'stats' });
    }
  };

  // Show menu button on all routes except main menu and save/profile screens
  const showMenuButton = ![
    '/', 
    '/save-select', 
    '/profile-creation',
    '/victory',
    '/defeat'
  ].includes(currentRoute);

  return (
    <div className="relative min-h-screen">
      {/* Menu Toggle Button - Top Right */}
      {showMenuButton && (
        <button
          onClick={handleToggleMenu}
          className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
          aria-label="Toggle menu"
        >
          {gameState.menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Game Menu Overlay */}
      {gameState.menuOpen && <GameMenu />}

      {/* Current Route */}
      {renderRoute()}
    </div>
  );
};

export default GameApp;