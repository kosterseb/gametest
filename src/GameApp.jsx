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
import { BranchingTreeMapView } from './components/Map/BranchingTreeMapView';
import { JokerNode } from './components/UI/JokerNode';
import { UnifiedRewardScreen } from './components/UI/UnifiedRewardScreen'; // ✅ FIXED
import { BossReward } from './components/UI/BossReward'; // ✅ FIXED
import { ActTransition } from './components/UI/ActTransitions';
import { PreBattleLoadout } from './components/UI/PreBattleLoadout';
import { BattleMenu } from './components/UI/BattleMenu';
import { GameMenu } from './components/UI/GameMenu';
import { SplashScreen } from './components/UI/SplashScreen';
import { Menu, User } from 'lucide-react';
import { NBButton } from './components/UI/NeoBrutalUI';

const GameApp = () => {
  const { currentRoute } = useRouter();
  const { gameState, dispatch } = useGame();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCharacterMenuOpen, setIsCharacterMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

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
        return gameState.useBranchingPaths ? <BranchingTreeMapView /> : <ProgressionMapView />;
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

  // Show menu buttons on all routes except main menu, save select, profile creation, and battle (battle has its own)
  const showMenuButtons = ![
    '/',
    '/save-select',
    '/profile-creation',
    '/battle'
  ].includes(currentRoute);

  // Handle character menu open/close
  const handleOpenCharacterMenu = () => {
    setIsCharacterMenuOpen(true);
    dispatch({ type: 'OPEN_MENU', tab: 'stats' });
  };

  const handleCloseCharacterMenu = () => {
    setIsCharacterMenuOpen(false);
    dispatch({ type: 'CLOSE_MENU' });
  };

  // If splash screen is still showing, render only that
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Menu Buttons - Top Right, Stacked Vertically (for non-battle routes) */}
      {showMenuButtons && (
        <div className={`fixed right-4 z-50 flex flex-col gap-3 ${currentRoute === '/map' ? 'top-48' : 'top-4'}`}>
          {/* Settings Menu Button - ON TOP */}
          <NBButton
            onClick={() => setIsMenuOpen(true)}
            variant="white"
            size="md"
            className="w-16 h-16 flex items-center justify-center p-0"
            aria-label="Open menu"
          >
            <Menu className="w-8 h-8" />
          </NBButton>

          {/* Character Button - UNDERNEATH with Avatar (only show if profile exists) */}
          {gameState.profile && (
            <button
              onClick={handleOpenCharacterMenu}
              className="w-16 h-16 nb-bg-cyan nb-border-xl nb-shadow-lg nb-hover flex items-center justify-center p-0 overflow-hidden"
              aria-label="Open character menu"
            >
              {gameState.profile.avatarSeed ? (
                <img
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${gameState.profile.avatarSeed}`}
                  alt="Your character"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-black" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Battle Menu - Settings/Utility (available on all routes except main menu) */}
      {currentRoute !== '/' && currentRoute !== '/save-select' && currentRoute !== '/profile-creation' && (
        <BattleMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          gameState={gameState}
        />
      )}

      {/* Character Menu - Deck/Inventory/Talents/Stats */}
      {isCharacterMenuOpen && <GameMenu onClose={handleCloseCharacterMenu} />}

      {/* Current Route */}
      {renderRoute()}
    </div>
  );
};

export default GameApp;