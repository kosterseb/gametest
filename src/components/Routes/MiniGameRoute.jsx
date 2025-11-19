import React, { useEffect } from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useGame } from '../../context/GameContext';
import { getRandomMiniGame } from '../../utils/miniGameManager';

/**
 * MiniGameRoute - Intelligent router for event node mini-games
 *
 * This component handles:
 * - Random mini-game selection
 * - Difficulty scaling based on act number
 * - Routing to the appropriate mini-game component
 */
const MiniGameRoute = () => {
  const { navigate, routeParams } = useRouter();
  const { gameState } = useGame();

  useEffect(() => {
    // Get random mini-game configuration
    const selectedGame = getRandomMiniGame({
      actNumber: gameState.currentAct
    });

    console.log('🎮 Selected mini-game:', selectedGame);

    // Prepare route params to pass to the game
    const gameParams = {
      nodeId: routeParams.nodeId,
      difficulty: selectedGame.difficulty,
      gameMode: selectedGame.gameMode,
      fromEventNode: true
    };

    // Navigate to the selected game
    navigate(selectedGame.route, gameParams);
  }, [navigate, routeParams, gameState.currentAct]);

  // Loading state while we redirect
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white nb-border p-12 text-center animate-pulse">
        <h2 className="text-4xl font-black mb-4">🎮 LOADING MINI-GAME...</h2>
        <p className="text-xl">Get ready for a challenge!</p>
      </div>
    </div>
  );
};

export default MiniGameRoute;
